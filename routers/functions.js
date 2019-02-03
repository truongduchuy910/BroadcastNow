const public_dut = require('../modules/public_dut')

module.exports = function(app) {
    app.get('/public_dut', async (req,res) => {
        var content = await public_dut.getNotifications();
        res.send({ "success": true });
    })
    app.get('/getData', async(req,res) => {
        await res.send('OK');
    })
}