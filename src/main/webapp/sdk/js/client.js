/**
*@namespace Sfdc.canvas.client
*@name Sfdc.canvas.client
*/
(function ($$) {

    "use strict";

    var pversion, cversion = "28.0";

    var module =   (function() /**@lends module */ {
        
        var purl, cbs = [], seq = 0, subscriber, autog = true;

        function startsWithHttp(u, d) {
            return  $$.isNil(u) ? u : (u.substring(0, 4) === "http") ? u : d;
        }
        /**
        * @description
        * @function
        * @returns The url of the Parent Window
        */
        function getTargetOrigin(to) {

            var h;

            if (to === "*") {return to;}

            if (!$$.isNil(to)) {
                h = $$.stripUrl(to);
                purl = startsWithHttp(h, purl);
                if (purl) {return purl;}
            }

            // This relies on the parent passing it in. This may not be there as the client can do a redirect.
            h = document.location.hash;
            if (h) {
                h = decodeURIComponent(h.replace(/^#/, ''));
                purl = startsWithHttp(h, purl);
            }
            return purl;
        }

        function callbacker(data) {

            if (data) {
                if (data.type === 'event') {
                    var event = data.payload;
                    if (subscriber) {
                        if ($$.isFunction(subscriber[event.name])) {
                            subscriber[event.name](event.value);
                        }
                    }
                }
                else if (data.type === 'callback') {
                    // If the server is telling us the access_token is invalid, wipe it clean.
                    if (data.status === 401 &&
                        $$.isArray(data.payload) &&
                        data.payload[0].errorCode &&
                        data.payload[0].errorCode === "INVALID_SESSION_ID") {
                        // Session has expired logout.
                        $$.oauth.logout();
                    }

                    if ($$.isFunction(cbs[data.seq])) {
                        cbs[data.seq](data);
                    }
                    else {
                        // This can happen when the user switches out canvas apps real quick,
                        // before the request from the last canvas app have finish processing.
                        // We will ignore any of these results as the canvas app is no longer active to
                        // respond to the results.
                    }
                }
                else {
                    throw "Undefined event type " + data.type;
                }
            }
        }

        function postit(clientscb, message) {

            var wrapped, to, c;

            // need to keep a mapping from request to callback, otherwise
            // wrong callbacks get called. Unfortunately, this is the only
            // way to handle this as postMessage acts more like topic/queue.
            // limit the sequencers to 100 avoid out of memory errors

            seq = (seq > 100) ? 0 : seq + 1;
            cbs[seq] = clientscb;
            wrapped = {seq : seq, src : "client", clientVersion : cversion, parentVersion: pversion, body : message};

            c  = message && message.config && message.config.client;
            to = getTargetOrigin($$.isNil(c) ? null : c.targetOrigin);
            if ($$.isNil(to)) {
                throw "ERROR: targetOrigin was not supplied and was not found on the hash tag, this can result from a redirect or link to another page. " +
                    "Try setting the targetOrgin (example: targetOrigin : sr.context.environment.targetOrigin) " +
                    "when making an ajax request.";
            }
            $$.xd.post(wrapped, to, parent);
        }

        function validateClient(client, cb) {

            var msg;

            if ($$.isNil(client) || $$.isNil(client.oauthToken)) {
                msg = {status : 401, statusText : "Unauthorized" , parentVersion : pversion, payload : "client or client.oauthToken not supplied"};
            }
            if ($$.isNil(client.instanceId) || $$.isNil(client.targetOrigin)) {
                msg = {status : 400, statusText : "Bad Request" , parentVersion : pversion, payload : "client.instanceId or client.targetOrigin not supplied"};
            }
            if (!$$.isNil(msg)) {
                if ($$.isFunction(cb)) {
                    cb(msg);
                    return false;
                }
                else {
                    throw msg;
                }
            }
            return true;
        }

        /**
        * @description Get the context for the current user and organization
        * @public
        * @name Sfdc.canvas.client#ctx
        * @function
        * @param {Function} clientscb Callback function to run when the call to ctx is complete
        * @param {String} token OAuth token to send. 
        * @example
        * // Gets context in the canvas app.
        * 
        * function callback(msg) {
        *   if (msg.status !== 200) {
        *     alert("Error: " + msg.status);
        *     return;
        *   }
        *   alert("Payload: ", msg.payload);
        * }
        * var ctxlink = connect.byId("ctxlink");
        * var oauthtoken = connect.oauth.token();
        * ctxlink.onclick=function() {
        *   connect.client.ctx(callback, oauthtoken)};
        * }
        */
        function ctx(clientscb, client) {
            client = client || $$.oauth.client();
            if (validateClient(client, clientscb)) {
                var token = client.oauthToken;
                postit(clientscb, {type : "ctx", accessToken : token, config : {client : client}});
            }
        }
        
        /**
        * @description Perform a cross-domain, asynchronous HTTP request.  
            <br>Note:  this should not be used for same domain requests.
        * @param {String} url The URL to which the request is sent
        * @param {Object} settings A set of key/value pairs to configure the request.  
            <br>The success setting is required at minimum and should be a callback function
         * @config {String} [client] required client context {oauthToken: "", targetOrigin : "", instanceId : ""}
         * @config {String} [contentType] "application/json"
         * @config {String} [data] request body
         * @config {String} [headers] request headers
         * @config {String} [method="GET"] The type of Ajax Request to make
         * @config {Function} [success] Callback for all responses from server (failure and success) . Signature: success(response); intersting fields: [response.data, response.responseHeaders, response.status, response.statusText}
         * @config {Boolean} [async=true] Asyncronous: true is only supported at this time.
         * @name Sfdc.canvas.client#ajax
        * @function
        * @throws illegalArgumentException if the URL is missing or the settings object does not contain a success callback function.
        * @example
        * //Posting To a Chatter Feed:
        * var sr = JSON.parse('<%=signedRequestJson%>');
        * var url = sr.context.links.chatterFeedsUrl+"/news/"
        *                                   +sr.context.user.userId+"/feed-items";
        * var body = {body : {messageSegments : [{type: "Text", text: "Some Chatter Post"}]}};
        * connect.client.ajax(url,
        *   {client : sr.client,
        *     method: 'POST',
        *     contentType: "application/json",
        *     data: JSON.stringify(body),
        *     success : function(data) {
        *     if (201 === data.status) {
        *          alert("Success"
        *          } 
        *     }
        *   });
        * @example
        * // Gets a List of Chatter Users:
        * // Paste the signed request string into a JavaScript object for easy access.
        * var sr = JSON.parse('<%=signedRequestJson%>');
        * // Reference the Chatter user's URL from Context.Links object.
        * var chatterUsersUrl = sr.context.links.chatterUsersUrl;
        *
        * // Make an XHR call back to salesforce through the supplied browser proxy.
        * connect.client.ajax(chatterUsersUrl,
        *   {client : sr.client,
        *   success : function(data){
        *   // Make sure the status code is OK.
        *   if (data.status === 200) {
        *     // Alert with how many Chatter users were returned.
        *     alert("Got back "  + data.payload.users.length +
        *     " users"); // Returned 2 users
        *    }
        * })};
        */
         function ajax(url, settings) {

            var ccb, config, defaults;

            if (!url) {
                throw "PRECONDITION ERROR: url required with AJAX call";
            }
            if (!settings || !$$.isFunction(settings.success)) {
                throw "PRECONDITION ERROR: function: 'settings.success' missing.";
            }
            if (! validateClient(settings.client, settings.success)) {
                return;
            }


            ccb = settings.success;
            defaults = {
                method: 'GET',
                async: true,
                contentType: "application/json",
                headers: {"Authorization" : "OAuth "  + settings.client.oauthToken,
                    "Accept" : "application/json"},
                data: null
            };
            config = $$.extend(defaults, settings || {});

            // Remove any listeners as functions cannot get marshaled.
            config.success = undefined;
            config.failure = undefined;
            // Don't allow the client to set "*" as the target origin.
            if (config.client.targetOrigin === "*") {
                config.client.targetOrigin = null;
            }
            else {
                // We need to set this here so we can validate the origin when we receive the call back
                purl = startsWithHttp(config.targetOrigin, purl);
            }
            postit(ccb, {type : "ajax", accessToken : token, url : url, config : config});
        }

        /**
         * @description Stores or gets the oauth token in a local javascript variable. Note, if longer term
         * (survive page refresh) storage is needed store the oauth token on the server side.
         * @param {String} t oauth token, if supplied it will be stored in a volatile local JS variable.
         * @returns {Object} the oauth token.
         */
        function token(t) {
            return $$.oauth.token(t);
        }

        /**
         * @description Returns the current version of the client.
         * @returns {Object} {clientVersion : "28.0"}.
         */
        function version() {
            return {clientVersion: cversion};
        }

        /**
         * @description Informs the parent window to resize your canvas iframe. If parameters are spcified
         * the parent window will attempt to automatically determine the height of the canvas app based off of
         * content and set the iframe's width and height accordingly. If you would like to set the dimension
         * explicitly pass in an object with height and/or width properties.
         * @param {Client} client object from signed request.
         * @param {Size} {height : "700px", width : "500px"} optional
         */
        function resize(client, size) {
            var sh, ch, sw, cw, s = {height : "", width : ""};

            // If the size was not supplied, adjust window
            if ($$.isNil(size)) {
                sh = document.documentElement.scrollHeight;
                ch = document.documentElement.clientHeight;
                if (ch !== sh) {
                    s.height = sh + "px";
                }
                sw = document.documentElement.scrollWidth;
                cw = document.documentElement.clientWidth;
                if (sw !== cw) {
                    s.width = sw + "px";
                }
            }
            else {
                if (!$$.isNil(size.height)) {
                    s.height = size.height;
                }
                if (!$$.isNil(size.width)) {
                    s.width = size.width;
                }
            }
            if (!$$.isNil(s.height) || !$$.isNil(s.width)) {
                postit(null, {type : "resize", config : {client : client}, size : s});
            }
        }

        /**
         * @description Convenience method for getting the current size of the iframe.
         * @return {size} {heights {} , widths : {}}
         * heights.contentHeight - the height of the virtual iframe, all content not just visible
         * heights.pageHeight - the height of the visible iframe in the browser
         * heights.scrollTop - the position of the scroll bar measured from the top
         * widths.contentWidth - the width of the virtual iframe, all content not just visible
         * widths.pageWidth - the width of the visible iframe in the browser
         * widths.scrollLeft - the position of the scroll bar measured from the left
         */
        function size() {

            var contentHeight = document.documentElement.scrollHeight,
                pageHeight = document.documentElement.clientHeight,
                scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop,
                contentWidth = document.documentElement.scrollWidth,
                pageWidth = document.documentElement.clientWidth,
                scrollLeft = (document.documentElement && document.documentElement.scrollLeft) || document.body.scrollLeft;

            return {heights : {contentHeight : contentHeight, pageHeight : pageHeight, scrollTop : scrollTop},
                    widths : {contentWidth : contentWidth, pageWidth : pageWidth, scrollLeft : scrollLeft}};
        }

        /**
         * @description Starts or stops a timer which will automatically check the content size of your iframe and adjust the frame accordingly.
         * Note: you should turn off scrolling before this call otherwise you can get a flicker.
         * @param {client} client object from signed request.
         * @param {boolean} turn on or off, true default
         * @param {interval} interval used to check content size, default timeout is 300ms.
         */
        function autogrow(client, b, interval) {

            interval = ($$.isNil(interval)) ? 300 : interval;
            autog  = ($$.isNil(b)) ? true : b;
            if (autog === false) {
                return;
            }
            setTimeout(function () {
                resize(client);
                autogrow(client, autog);
            },interval);
        }

        function subscriptions(obj) {
            var sub = {};
            $$.each(obj, function (v, i) {
                if (i.substring(0, 2) === "on") {
                    sub[i] = true;
                }
            });
            return sub;
        }

        /**
         * @description Subscribe to events. "onScroll" currently only supported callback.
         * @param {client} client object from signed request.
         * @param {Object} s subscriber object with callback functions.
         */
        function subscribe(client, s) {
            var subs;
            subscriber = s;
            // Only support onScroll for now...
            if (!$$.isNil(subscriber) && $$.isFunction(subscriber.onScroll)) {
                client = client || $$.oauth.client();
                if (validateClient(client)) {
                    subs = subscriptions(subscriber);
                    postit(null, {type : "subscribe", config : {client : client}, subscriptions : subs});
                }
            }
        }

        $$.xd.receive(callbacker, getTargetOrigin);

        return {
            ctx : ctx,
            ajax : ajax,
            token : token,
            version : version,
            resize : resize,
            size : size,
            autogrow : autogrow,
            subscribe : subscribe
        };
    }());

    $$.module('Sfdc.canvas.client', module);

}(Sfdc.canvas));
