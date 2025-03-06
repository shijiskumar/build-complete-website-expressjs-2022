// error.js - Error handling middleware
module.exports = function (err, req, res, next) {
    console.log(err);  // Log error details for debugging
  
    // Customize status and message based on error type if needed
    const status = err.status || 500;
    const message = err.message || "Something went wrong! Please try again later.";
    const stack = err.stack || "No stack trace available";
  
    // Render an error page using a view template or send JSON if API
    if (req.accepts("html")) {
      res.status(status).render("error", {
        title: "Error",
        status,
        message,
        stack  // Pass the full stack to the template
      });
    } else if (req.accepts("json")) {
      res.status(status).json({ error: message, stack});
    } else {
      res.status(status).type("txt").send(`${message}\n\n${stack}`);
    }
  };
  