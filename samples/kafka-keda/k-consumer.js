module.exports = async function (context) {
    console.log("Kafka Consumed:")
    console.log(context.request.body);
    let obj = context.request.body;
    obj.kstatus = "Kafka processed"
    return {
        status: 200,
        body: obj
    };
}