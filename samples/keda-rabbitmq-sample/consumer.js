module.exports = async function (context) {
    console.log("RabbitMQ Consumed:")
    console.log(context.request.body);
    let obj = context.request.body;
    obj.rstatus = "RabbitMQ processed"
    return {
        status: 200,
        body: obj
    };
}