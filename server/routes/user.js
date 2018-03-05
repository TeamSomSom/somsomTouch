

const Controller = require('../controllers/user');

module.exports = [
    { method: 'GET', path: '/login.html'},
    { method: 'POST', path:'/user/signup', config: Controller.create},
    { method: 'POST', path:'/user/update'}
];
