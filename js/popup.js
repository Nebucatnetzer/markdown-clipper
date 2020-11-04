function listenForClicks() {
    document.addEventListener("click", (e) => {
        function extract(tabs) {
            browser.tabs.sendMessage(tabs[0].id, {
                command: "extract",
            });
        }
        /*
         * send a "reset" message to the content script in the active tab.
         */
        function reset(tabs) {
            browser.tabs.sendMessage(tabs[0].id, {
                command: "reset",
            });
        }

        /*
         * Get the active tab,
         * then call "extract()" or "reset()" as appropriate.
         */
        if (e.target.classList.contains("extract")) {
            browser.tabs
                .query({ active: true, currentWindow: true })
                .then(extract)
                .catch(reportError);
        } else if (e.target.classList.contains("reset")) {
            browser.tabs
                .query({ active: true, currentWindow: true })
                .then(reset)
                .catch(reportError);
        }
    });
}

function reportExecuteScriptError(error) {
    document.querySelector("#popup-content").classList.add("hidden");
    document.querySelector("#error-content").classList.remove("hidden");
    console.error(`Failed to execute content script: ${error.message}`);
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
browser.tabs
    .executeScript({ file: "/js/pageScrapper.js" })
    .then(listenForClicks)
    .catch(reportExecuteScriptError);