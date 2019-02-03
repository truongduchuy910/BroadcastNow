module.exports = function(app) {
    app.get('/public_dut', async (req,res) => {
        var content = await public_dut.getNotifications();
        res.send("OK");
    })
    app.get('/getData', async(req,res) => {
        await res.send('OK');
    })
}