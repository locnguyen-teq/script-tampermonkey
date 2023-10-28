// ==UserScript==
// @name         Backlog Plus
// @match		https://*.backlog.com/*
// @author		ARM
// @grant        none
// @run-at		document-end
// ==/UserScript==


let checkCount = 0;
/*--- waitForKeyElements():  A utility function, for Greasemonkey scripts,
    that detects and handles AJAXed content.

    Usage example:

        waitForKeyElements (
            "div.comments"
            , commentCallbackFunction
        );

        //--- Page-specific function to do what we want when the node is found.
        function commentCallbackFunction (jNode) {
            jNode.text ("This comment changed by waitForKeyElements().");
        }

    IMPORTANT: This function requires your script to have loaded jQuery.
*/
function waitForKeyElements (
selectorTxt,    /* Required: The jQuery selector string that
                        specifies the desired element(s).
                    */
 actionFunction, /* Required: The code to run when elements are
                        found. It is passed a jNode to the matched
                        element.
                    */
 bWaitOnce,      /* Optional: If false, will continue to scan for
                        new elements even after the first match is
                        found.
                    */
 iframeSelector  /* Optional: If set, identifies the iframe to
                        search.
                    */
) {
    let targetNodes, btargetsFound;
    if (checkCount > 100) {
        return;
    }
    checkCount++;

    if (typeof iframeSelector == "undefined")
        targetNodes    = $(selectorTxt);
    else
        targetNodes     = $(iframeSelector).contents ()
            .find (selectorTxt);

    if (targetNodes  &&  targetNodes.length > 0) {
        btargetsFound   = true;
        /*--- Found target node(s).  Go through each and act if they
            are new.
        */
        targetNodes.each ( function () {
            var jThis        = $(this);
            var alreadyFound = jThis.data ('alreadyFound')  ||  false;

            if (!alreadyFound) {
                //--- Call the payload function.
                var cancelFound     = actionFunction (jThis);
                if (cancelFound)
                    btargetsFound   = false;
                else
                    jThis.data ('alreadyFound', true);
            }
        } );
    }
    else {
        btargetsFound   = false;
    }

    //--- Get the timer-control variable for this selector.
    var controlObj      = waitForKeyElements.controlObj  ||  {};
    var controlKey      = selectorTxt.replace (/[^\w]/g, "_");
    var timeControl     = controlObj [controlKey];

    //--- Now set or clear the timer as appropriate.
    if (btargetsFound  &&  bWaitOnce  &&  timeControl) {
        //--- The only condition where we need to clear the timer.
        clearInterval (timeControl);
        delete controlObj [controlKey]
    }
    else {
        //--- Set a timer, if needed.
        if ( ! timeControl) {
            timeControl = setInterval ( function () {
                waitForKeyElements (    selectorTxt,
                                    actionFunction,
                                    bWaitOnce,
                                    iframeSelector
                                   );
            },
                                       1000
                                      );
            controlObj [controlKey] = timeControl;
        }
    }
    waitForKeyElements.controlObj   = controlObj;
}

let show = true


waitForKeyElements (".backlog__plugin-col", elems => {
    if(show) {
        elems.click();
        show = false
    }
},true);


waitForKeyElements ("#backlog_plugin", elems => {
    elems.draggable({
        start: function() {
            elems.css({
                "right":"auto"
            });
        },
        stop: function(_, ui) {
            // Save position
            localStorage.setItem('backlogPluginPos', ui.position.left + ',' + ui.position.top);
        },
        containment: "#container",
        scroll: false,
        cursorAt: { bottom: 0 }
    });
            // Set initial position from saved value
  let pos = localStorage.getItem('backlogPluginPos');
  if (pos) {
    let [left, top] = pos.split(',');
    elems.css({
        "right":"auto",
      "left":left+"px",
      "top":top+"px"
    });
  }

},true);
