// make a hellow world aws lambda function handler
module.exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello World!',
    }),
  };
}
