
//
// ─── CLASS ERRORRESPONSE ────────────────────────────────────────────────────────
//

    class ErrorResponse extends Error {
        constructor(messge, statusCode){
            super(messge);
            this.statusCode = statusCode;
        }
    }

    

module.exports = ErrorResponse;