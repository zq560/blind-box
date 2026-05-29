const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const DATA = path.join(__dirname, 'orders.json');
const USERS = path.join(__dirname, 'users.json');
app.use(express.json());
app.use(express.static(__dirname));

function readOrders(){
  try{ return JSON.parse(fs.readFileSync(DATA,'utf8')||'[]'); }catch(e){ return []; }
}
function writeOrders(list){ fs.writeFileSync(DATA, JSON.stringify(list, null, 2)); }
function readUsers(){
  try{return JSON.parse(fs.readFileSync(USERS,'utf8')||'[]');}catch(e){return []}
}
function writeUsers(list){ fs.writeFileSync(USERS, JSON.stringify(list, null, 2)); }
function getUserFromAuth(req){
  const auth = req.headers['authorization'];
  if(!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.split(' ')[1];
  return readUsers().find(u=>u.token===token) || null;
}
function orderBelongsToUser(order, user){
  return Boolean(user && (order.userId === user.id || order.userPhone === user.phone));
}
const PRIZES = [
  {id: 'iphone', name: '苹果手机', description: '苹果手机，中奖概率 1%', probability: 1, image: '苹果手机.png'},
  {id: 'cash99', name: '99元红包', description: '99 块钱红包，中奖概率 10%', probability: 10, image: '美金.webp'},
  {id: 'thanks', name: '谢谢参与', description: '谢谢参与，概率 89%', probability: 89, image: '微信图片_20260529185123_95_2.jpg'}
];
function drawOnePrize(){
  const roll = Math.random() * 100;
  if(roll < 1) return {...PRIZES[0]};
  if(roll < 11) return {...PRIZES[1]};
  return {...PRIZES[2]};
}
function makeBlindBoxResult(quantity){
  const count = Math.max(1, Number(quantity) || 1);
  const results = [];
  for(let i = 0; i < count; i += 1){
    results.push(drawOnePrize());
  }
  return results;
}
function normalizePrizeResult(result){
  if(!Array.isArray(result)) return [];
  return result.map(item => {
    if(item && typeof item === 'object') return item;
    const found = PRIZES.find(prize => prize.name === item);
    return found ? {...found} : {id: 'old', name: String(item || '未知奖品'), description: String(item || '未知奖品'), probability: null, image: ''};
  });
}
function serializeOrder(order){
  return {...order, blindBoxResult: normalizePrizeResult(order.blindBoxResult)};
}
function fulfillmentAfterDraw(prizes){
  const normalized = normalizePrizeResult(prizes);
  const needsDelivery = normalized.some(prize => prize.id !== 'thanks' && prize.name !== '谢谢参与');
  return needsDelivery ? 'pendingShipment' : 'received';
}

app.post('/api/orders', (req, res)=>{
  const order = req.body || {};
  const orders = readOrders();
  const today = new Date();
  const pad = n => String(n).padStart(2, '0');
  const dateCode = `${today.getFullYear()}${pad(today.getMonth() + 1)}${pad(today.getDate())}`;
  const seq = orders.filter(o => String(o.id || '').startsWith(dateCode)).length + 1;
  const id = `${dateCode}${seq}`;
  // 客户端 IP（支持反向代理的 X-Forwarded-For）
  const ip = (req.headers['x-forwarded-for'] || '').split(',').shift() || req.ip || req.socket.remoteAddress;
  order.id = id;
  order.status = 'pending';
  order.ip = ip;
  order.createdAt = order.createdAt || new Date().toISOString();
  // 关联用户（如果有 token）
  const auth = req.headers['authorization'];
  if(auth && auth.startsWith('Bearer ')){
    const token = auth.split(' ')[1];
    const users = readUsers();
    const user = users.find(u=>u.token===token);
    if(user){ order.userId = user.id; order.userPhone = user.phone; }
  }
  orders.push(order);
  writeOrders(orders);
  res.json({ok:true, id});
});

// 注册
app.post('/api/register', (req, res)=>{
  const {name, phone, password} = req.body || {};
  if(!phone || !password) return res.status(400).json({ok:false,msg:'phone and password required'});
  const users = readUsers();
  if(users.find(u=>u.phone===phone)) return res.status(400).json({ok:false,msg:'phone exists'});
  const id = Date.now().toString(36);
  const crypto = require('crypto');
  const salt = crypto.randomBytes(8).toString('hex');
  const hash = crypto.createHash('sha256').update(salt+password).digest('hex');
  const token = crypto.randomBytes(16).toString('hex');
  const user = {id, name:name||phone, phone, salt, hash, token};
  users.push(user);
  writeUsers(users);
  res.json({ok:true, id, token});
});

// 登录
app.post('/api/login', (req, res)=>{
  const {phone, password} = req.body || {};
  if(!phone || !password) return res.status(400).json({ok:false,msg:'phone and password required'});
  const users = readUsers();
  const user = users.find(u=>u.phone===phone);
  if(!user) return res.status(400).json({ok:false,msg:'user not found'});
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(user.salt+password).digest('hex');
  if(hash !== user.hash) return res.status(400).json({ok:false,msg:'invalid credentials'});
  // 生成新 token
  user.token = crypto.randomBytes(16).toString('hex');
  writeUsers(users);
  res.json({ok:true, id:user.id, token:user.token, name:user.name});
});

// 当前用户订单
app.get('/api/myorders', (req, res)=>{
  const user = getUserFromAuth(req);
  if(!user) return res.status(401).json({ok:false,msg:'invalid token'});
  const orders = readOrders();
  const mine = orders.filter(o=>orderBelongsToUser(o, user));
  res.json(mine.map(serializeOrder));
});

app.get('/api/orders', (req, res)=>{
  res.json(readOrders().map(serializeOrder));
});

// 管理后台：获取待处理订单
app.get('/api/orders/pending', (req, res)=>{
  const orders = readOrders();
  const pending = orders.filter(o=>o.status === 'pending');
  res.json(pending.map(serializeOrder));
});

// 客户端查询当前订单审核结果
app.get('/api/orders/:id/status', (req, res)=>{
  const id = req.params.id;
  const orders = readOrders();
  const order = orders.find(o=>String(o.id) === String(id));
  if(!order) return res.status(404).json({ok:false,msg:'order not found'});
  res.json({
    id: order.id,
    status: order.status || 'pending',
    fulfillmentStatus: order.fulfillmentStatus || null,
    userSeen: Boolean(order.userSeen),
    decisionAt: order.decisionAt || null,
    blindBoxResult: normalizePrizeResult(order.blindBoxResult),
    openedAt: order.openedAt || null,
    shippedAt: order.shippedAt || null,
    receivedAt: order.receivedAt || null
  });
});

// 客户打开盲盒，保存本订单的开盒结果
app.post('/api/orders/:id/open-box', (req, res)=>{
  const user = getUserFromAuth(req);
  if(!user) return res.status(401).json({ok:false,msg:'auth required'});
  const id = req.params.id;
  const orders = readOrders();
  const idx = orders.findIndex(o=>String(o.id) === String(id));
  if(idx === -1) return res.status(404).json({ok:false,msg:'order not found'});
  const order = orders[idx];
  if(!orderBelongsToUser(order, user)) return res.status(403).json({ok:false,msg:'forbidden'});
  if(order.status !== 'accepted') return res.status(400).json({ok:false,msg:'order not accepted'});
  if(!Array.isArray(order.blindBoxResult) || !order.blindBoxResult.length){
    order.blindBoxResult = makeBlindBoxResult(order.quantity);
    order.openedAt = new Date().toISOString();
  }
  order.fulfillmentStatus = fulfillmentAfterDraw(order.blindBoxResult);
  if(order.fulfillmentStatus === 'received'){
    order.receivedAt = order.receivedAt || new Date().toISOString();
  }
  order.userSeen = true;
  orders[idx] = order;
  writeOrders(orders);
  res.json({
    ok:true,
    id: order.id,
    blindBoxResult: normalizePrizeResult(order.blindBoxResult),
    openedAt: order.openedAt,
    fulfillmentStatus: order.fulfillmentStatus,
    receivedAt: order.receivedAt || null
  });
});

// 管理决定：同意或拒绝订单
app.post('/api/orders/:id/decision', (req, res)=>{
  const id = req.params.id;
  const {decision} = req.body || {};
  if(!decision || !['accept','reject'].includes(decision)) return res.status(400).json({ok:false,msg:'invalid decision'});
  const orders = readOrders();
  const idx = orders.findIndex(o=>String(o.id) === String(id));
  if(idx === -1) return res.status(404).json({ok:false,msg:'order not found'});
  const order = orders[idx];
  order.status = decision === 'accept' ? 'accepted' : 'rejected';
  order.decisionAt = new Date().toISOString();
  order.decisionBy = 'admin';
  if(decision === 'accept'){
    order.fulfillmentStatus = Array.isArray(order.blindBoxResult) && order.blindBoxResult.length
      ? fulfillmentAfterDraw(order.blindBoxResult)
      : 'awaitingDraw';
  }else{
    order.fulfillmentStatus = 'cancelled';
  }
  // 标记用户尚未看到该结果
  order.userSeen = false;
  orders[idx] = order;
  writeOrders(orders);
  res.json({ok:true, id});
});

// 后台发货
app.post('/api/orders/:id/ship', (req, res)=>{
  const id = req.params.id;
  const orders = readOrders();
  const idx = orders.findIndex(o=>String(o.id) === String(id));
  if(idx === -1) return res.status(404).json({ok:false,msg:'order not found'});
  const order = orders[idx];
  if(order.status !== 'accepted') return res.status(400).json({ok:false,msg:'order not accepted'});
  if(order.fulfillmentStatus !== 'pendingShipment') return res.status(400).json({ok:false,msg:'order not ready to ship'});
  order.fulfillmentStatus = 'shipped';
  order.shippedAt = new Date().toISOString();
  orders[idx] = order;
  writeOrders(orders);
  res.json({ok:true, id});
});

// 客户确认收货
app.post('/api/orders/:id/receive', (req, res)=>{
  const user = getUserFromAuth(req);
  if(!user) return res.status(401).json({ok:false,msg:'auth required'});
  const id = req.params.id;
  const orders = readOrders();
  const idx = orders.findIndex(o=>String(o.id) === String(id));
  if(idx === -1) return res.status(404).json({ok:false,msg:'order not found'});
  const order = orders[idx];
  if(!orderBelongsToUser(order, user)) return res.status(403).json({ok:false,msg:'forbidden'});
  if(order.fulfillmentStatus !== 'shipped') return res.status(400).json({ok:false,msg:'order not shipped'});
  order.fulfillmentStatus = 'received';
  order.receivedAt = new Date().toISOString();
  orders[idx] = order;
  writeOrders(orders);
  res.json({ok:true, id});
});

// 用户查看后标记为已读（前端调用以避免重复弹窗）
app.post('/api/orders/:id/seen', (req, res)=>{
  const id = req.params.id;
  const orders = readOrders();
  const idx = orders.findIndex(o=>String(o.id) === String(id));
  if(idx === -1) return res.status(404).json({ok:false,msg:'order not found'});
  orders[idx].userSeen = true;
  writeOrders(orders);
  res.json({ok:true});
});

const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log('Server running on http://localhost:'+port));
