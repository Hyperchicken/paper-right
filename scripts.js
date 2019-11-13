if(location.hash == "#/home") {
    createUnreadTab(getUnreadEntries());
  }
  window.addEventListener('hashchange', function(){
    if(location.hash == "#/home") {
      createUnreadTab(getUnreadEntries());
    }
  });
  
  /*
  callListAPI(catId)
  Sends a request to the Paperlite API and returns an object with the request results.
  @param catId - the ID number of a category (paperlite folder) to be requested. Leave this blank to request the root directory.
  @return Object - a JS object containing the results from the API call. Object contains 3 elements: parents, categories and entries.
  */
  function callListAPI(catId) {
    if(!catId) catId = "";
    console.debug("Scanning media-list directory: \"" + catId + "\"");
    let xhttp = new XMLHttpRequest();
    xhttp.open("GET", "https://paperlite.metroapp.com.au/api/media-list/list/" + catId, false);
    xhttp.send();
    return JSON.parse(xhttp.responseText);
  }
  
  /*
  getUnreadEntries(catId)
  Gets all unread entries from a category (paperlite folder)
  @param catId - the ID number of a category folder to be scanned for unread entries. All subdirectories are scanned also. Leave this blank to scan all
  */
  function getUnreadEntries(catId) {
    let unreadEntries = [];
    if(!catId) catId = "";
    let response = callListAPI(catId);
    if(response.categories){
      for(let i=0; i < response.categories.length; i++) {
      if(response.categories[i].unreadCount > 0) {
        console.debug("> Unread items found in category: " + response.categories[i].title);
        unreadEntries = unreadEntries.concat(getUnreadEntries(response.categories[i].id));
        }
      }
    }
    if(response.entries){
      for(let i=0; i < response.entries.length; i++) {
        if(response.entries[i].unread){
          console.debug(">> Unread entry found: \"" + response.entries[i].title + "\"");
          unreadEntries.push(response.entries[i]);
        }
      }
    }
    return unreadEntries;
  }
  
  function createUnreadTab(unreadEntries) {
    let tabBar = document.getElementsByClassName('tabs')[0];
    let unreadTab = tabBar.firstElementChild.cloneNode(true);
    let unreadIcon = document.createElement('i');
    let unreadCounter = document.createElement('span');
    unreadIcon.setAttribute('class', 'mc mc-2x mc-icon-envelope');
    unreadCounter.setAttribute('class', 'label-primary');
    unreadCounter.textContent = unreadEntries.length;
    unreadTab.textContent = "  Unread ";
    unreadTab.insertBefore(unreadIcon, unreadTab.firstChild);
    unreadTab.appendChild(unreadCounter);
    unreadTab.addEventListener('click', function(){displayUnreadEntries(unreadEntries);});
    tabBar.appendChild(unreadTab);
  }
  
  function displayUnreadEntries(unreadEntries) {
    //window.location.replace('/#/media-list/1'); //navigate to an arbitrary directory to allow the user to navigate away from the unread page.
    let oldTitle = document.querySelector('.title');
    let newTitle = oldTitle.cloneNode(true);
    newTitle.firstChild.textContent = "Unread";
    oldTitle.style.display = 'none'; //hide existing title
    oldTitle.parentNode.insertBefore(newTitle, oldTitle.parentNode.childNodes[3]);
    let resultsParentDiv = document.querySelector('div.flex:nth-child(4)');
    while(resultsParentDiv.hasChildNodes()) { //clear existing results
      resultsParentDiv.removeChild(resultsParentDiv.firstChild);
    }
    let resultsDiv = document.createElement('div');
    resultsDiv.setAttribute('class', 'standard-padding');
    if(unreadEntries.length > 0) {
      for(let i = 0; i < unreadEntries.length; i++) {
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
        card.addEventListener('click', function(){window.open('#/media/' + unreadEntries[i].parentCategoryId + '/' + unreadEntries[i].id)});
        resultsDiv.appendChild(card);
      }
      resultsParentDiv.appendChild(resultsDiv);
    }
  }
  
  //#/media/<parent>/<id>
  //window.location.replace('/#/home')
  //window.location.replace('/#/media/1069/1455477')