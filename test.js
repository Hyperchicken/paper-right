javascript:void((function(){
    function callListAPI(catId) {
        if (!catId) catId = "";
        console.debug("Scanning media-list directory: \"" + catId + "\"");
        let xhttp = new XMLHttpRequest();
        xhttp.open("GET", "https://paperlite.metroapp.com.au/api/media-list/list/" + catId, false);
        xhttp.send();
        return JSON.parse(xhttp.responseText);
    }
    function getUnreadEntries(catId) {
        let unreadEntries = [];
        if (!catId) catId = "";
        let response = callListAPI(catId);
        if (response.categories) {
            for (let i = 0; i < response.categories.length; i++) {
                if (response.categories[i].unreadCount > 0) {
                    console.debug("> Unread items found in category: " + response.categories[i].title);
                    unreadEntries = unreadEntries.concat(getUnreadEntries(response.categories[i].id));
                }
            }
        }
        if (response.entries) {
            for (let i = 0; i < response.entries.length; i++) {
                if (response.entries[i].unread) {
                    console.debug(">> Unread entry found: \"" + response.entries[i].title + "\"");
                    unreadEntries.push(response.entries[i]);
                }
            }
        }
        return unreadEntries;
    }
    function displayUnreadEntries(unreadEntries) {
        //window.location.replace('/#/media-list/1'); //navigate to an arbitrary directory to allow the user to navigate away from the unread page.
        let oldTitle = document.querySelector('.title');
        let newTitle = oldTitle.cloneNode(true);
        newTitle.firstChild.textContent = "Unread";
        oldTitle.style.display = 'none'; //hide existing title
        oldTitle.parentNode.insertBefore(newTitle, oldTitle.parentNode.childNodes[3]);
        let resultsParentDiv = document.querySelector('div.flex:nth-child(4)');
        while (resultsParentDiv.hasChildNodes()) { //clear existing results
            resultsParentDiv.removeChild(resultsParentDiv.firstChild);
        }
        let resultsDiv = document.createElement('div');
        resultsDiv.setAttribute('class', 'standard-padding');
        if (unreadEntries.length > 0) {
            for (let i = 0; i < unreadEntries.length; i++) {
                let card = document.createElement('div');
                card.setAttribute('class', 'card');
                card.setAttribute('style', 'padding: 0; border-radius: 0;cursor: pointer;');
                let layoutDiv = document.createElement('div');
                layoutDiv.setAttribute('class', 'layout-row layout-align-center-center');
                card.appendChild(layoutDiv);
                let textArea = document.createElement('div');
                textArea.setAttribute('class', 'flex standard-padding');
                layoutDiv.appendChild(textArea);
                let entryTitle = document.createElement('div');
                entryTitle.textContent = unreadEntries[i].title;
                textArea.appendChild(entryTitle);
                let updateDate = document.createElement('div');
                updateDate.setAttribute('class', 'small text-muted yo');
                updateDate.textContent = "Updated " + unreadEntries[i].lastUpdated.yyyymmddhhmmss;
                textArea.appendChild(updateDate);
                let newLabel = document.createElement('span');
                newLabel.setAttribute('class', 'label-primary');
                newLabel.textContent = 'New!';
                updateDate.insertBefore(newLabel, updateDate.firstChild);
                let thumbnail = document.createElement('div');
                thumbnail.setAttribute('style', 'max-height: 101px;');
                layoutDiv.appendChild(thumbnail);
                let thumbnailImage = document.createElement('img');
                thumbnailImage.setAttribute('src', unreadEntries[i].thumbnailUrl);
                thumbnailImage.setAttribute('style', 'margin: 0; height: 100px; width: 70px; border: 1px solid #ddd;');
                thumbnail.appendChild(thumbnailImage);
                card.addEventListener('click', function () { window.open('#/media/' + unreadEntries[i].parentCategoryId + '/' + unreadEntries[i].id) });
                resultsDiv.appendChild(card);
            }
            resultsParentDiv.appendChild(resultsDiv);
        }
    }
    displayUnreadEntries(getUnreadEntries())

})());