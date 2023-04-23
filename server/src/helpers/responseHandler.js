const errorResponse = (res, status, message) => {
  return res.status(status).json({
    ok: false,
    message: message,
  });
};
const successResponse = (res, status, message, data = "") => {
  return res.status(status).json({
    ok: true,
    message: message,
    data: data,
  });
};
module.exports = { errorResponse, successResponse };
