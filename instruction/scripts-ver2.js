/*
* JS scripts for MyUI-RPLabeling (Local Version)
* Version 3: update on 05/21
*/


var id = 2;
var shadowRoot = $('#crowd-polygon')[0].shadowRoot;
var newUser = true;

document.addEventListener('all-crowd-elements-ready', function () {
    console.log("all crowd elements ready!");

    defineLayout();

    setInstruction();

    defineLabelButtons();

    $("crowd-form").submit(function () {
        console.log("Thank you for your comment!");
        console.log($("crowd-tool")[0].value);
    });


});

function alertFunc() {
    alert("Hello!");
}

/*
* Function to define the layout
*/
function defineLayout() {
    // $('head').append('<link rel="stylesheet" type="text/css" href="style.css">');
    $('head').append('<link rel="stylesheet" type="text/css" href="https://sagemaker-studio-f5iy3bqk9dc.s3.us-east-2.amazonaws.com/user+interface/RP/style.css">');
    $('#container').addClass('col-10');
    $('form').css('display', 'inherit');
    return
}

/*
* Function to set the instruction part
*/
function setInstruction() {
    // Short instruction Part
    var CoreContainer = $("#crowd-polygon")[0]
    var shortInstruction = document.createElement("short-instructions");

    var req1 = new XMLHttpRequest();

    req1.onload = function (e) {
        shortInstruction.innerHTML = e.target.response;
    };

    // req1.open("GET", "instruction.html", true);
    req1.open("GET", "https://sagemaker-studio-f5iy3bqk9dc.s3.us-east-2.amazonaws.com/user+interface/RP/instruction.html", true);
    req1.send();

    CoreContainer.append(shortInstruction);

    // click instruction button to show the RP instruction by default for new users
    if (newUser == true) {
        var shadowRoot = $('#crowd-polygon')[0].shadowRoot;
        var headerButtonsContainer = $(".headerButtonsContainer", shadowRoot);
        var instructButton = $(":button", headerButtonsContainer).get(0);
        instructButton.click();
    }

    // Full instruction part
    var fullInstruction = document.createElement("full-instructions");
    var req2 = new XMLHttpRequest();

    req2.onload = function (e) {
        fullInstruction.innerHTML = e.target.response;
    };

    // req2.open("GET", "full-insruction.html", true);
    req2.open("GET", "https://sagemaker-studio-f5iy3bqk9dc.s3.us-east-2.amazonaws.com/user+interface/RP/full-instruction.html", true);
    req2.send();

    CoreContainer.append(fullInstruction);
}

/*
* Function to define label buttons: add, remove
*/
function defineLabelButtons() {
    var buttonContainer = document.createElement("div");
    buttonContainer.classList.add('col-2');
    buttonContainer.style.padding = '5px';
    $('#form').append(buttonContainer);

    // button part
    var dummyButton = document.createElement("crowd-button");     // a dummy button to avoid warnings 
    dummyButton.style.display = "none";

    var addLabelButton = document.createElement("crowd-button");
    addLabelButton.id = "addButton";
    addLabelButton.innerHTML = "Add Label";
    addLabelButton.classList.add('label-button');

    var removeLabelButton = document.createElement("crowd-button");
    removeLabelButton.id = "removeButton";
    removeLabelButton.innerHTML = "Remove Label";
    removeLabelButton.classList.add('label-button');

    var cookieButton = document.createElement("crowd-button");
    cookieButton.id = "removeButton";
    cookieButton.innerHTML = "I'm a novice!";
    cookieButton.classList.add('cookie-button');

    buttonContainer.append(dummyButton);
    buttonContainer.append(addLabelButton);
    // buttonContainer.append(removeLabelButton);
    buttonContainer.append(cookieButton);


    // label selection part
    var crowdRoot = $('#crowd-polygon')[0];
    var labelsSection = document.createElement("div");
    labelsSection.classList.add('col-2');
    labelsSection.classList.add('labelsSelection');
    // labelsSection.style.height = '80vh';
    // labelsSection.style.overflow = 'scroll';
    // labelsSection.css({ 'height': '80vh' });
    $('#form').append(labelsSection);
    populateLabelsSection(labelsSection, crowdRoot);

    // recover button
    var recoverLabelButton = document.createElement("crowd-button");
    recoverLabelButton.id = "recoverButton";
    recoverLabelButton.innerHTML = "Recover Label";
    recoverLabelButton.classList.add('label-button');

    buttonContainer = document.createElement("div");
    buttonContainer.classList.add('col-2');
    buttonContainer.style.padding = '5px';
    // buttonContainer.append(recoverLabelButton);
    // $('#form').append(buttonContainer);

    // switch button
    var switchButton = document.createElement("crowd-button");
    switchButton.id = "switchButton";
    switchButton.innerHTML = "Switch to Box!";
    switchButton.classList.add('label-button');
    // buttonContainer.append(switchButton);
    // $('#form').append(buttonContainer);


    // bind click functions
    addLabelButton.onclick = function () {
        id = addLabel(labelsSection, crowdRoot, id);
    };
    removeLabelButton.onclick = function () {
        id = removeLabel(crowdRoot, id);
    };
    recoverLabelButton.onclick = function () {
        id = recoverLabel(crowdRoot, id);
    };
    switchButton.onclick = function () {
        switchTool();
    };


    cookieButton.onclick = function () {
        setCookie(true);
        tutorial();
        // location.reload();
    };
}

/*
* Function to add a label
*/
function addLabel(labelsSection, crowdRoot, id) {
    console.log("Click Add Button!");
    crowdRoot.labels = crowdRoot.labels.concat(['Recurring Pattern ' + id]);
    id += 1;

    // for category focus checking
    // $('div.label-button', shadowRoot).click(alertFunc());
    populateLabelsSection(labelsSection, crowdRoot)
    return id;
}

/*
* Function to remove a label
*/
function removeLabel(crowdRoot, id) {
    console.log("Click Remove Button!");
    if (id - 1 < 1) return;
    label = 'Recurring Pattern ' + (id - 1).toString()
    //console.log(label)
    crowdRoot.labels = crowdRoot.labels.filter(function (l) {
        return l !== label;
    });

    // crowdRoot.value = crowdRoot.value.filter(function (l) {
    //     return l['label'] !== label;
    // });

    id -= 1;
    return id;
}

function recoverLabel(crowdRoot, id) {
    console.log("Click Recover Button!");
    crowdRoot.labels = '';
    for (var i = 2; i < id; i++) {
        crowdRoot.labels = crowdRoot.labels.concat(['Recurring Pattern ' + (i - 1).toString()]);
    }

    console.log(crowdRoot.labels)

    return id;
}

function populateLabelsSection(labelsSection, crowdRoot) {
    labelsSection.innerHTML = '';
    crowdRoot.labels.forEach(function (label) {
        const labelContainer = document.createElement('div');
        labelContainer.innerHTML = label + ' <a href="javascript:void(0)">(Delete)</a>';
        labelContainer.querySelector('a').onclick = function () {
            crowdRoot.labels = crowdRoot.labels.filter(function (l) {
                return l !== label;
            });
            populateLabelsSection(labelsSection, crowdRoot);
        };
        labelsSection.appendChild(labelContainer);
    });
}

function checkFocus() {
    var focus = document.activeElement;
    console.log(focus);
    focus.blur();
}

function switchTool() {
    var curLabelTool = $('#crowd-polygon');
    var newLabelTool = document.createElement('crowd-bounding-box');
    // newLabelTool.id = curLabelTool.attr('id');
    // newLabelTool.name = curLabelTool.attr('name');
    // newLabelTool.src = curLabelTool.attr('src');
    newLabelTool.header = curLabelTool.attr('header');
    newLabelTool.labels = curLabelTool.attr('labels');
    console.log(curLabelTool.attr('labels'));
    curLabelTool.remove();
    $('#container').append(newLabelTool);
}

function setCookie(value) {
    document.cookie = 'first' + '=' + value;
}
function getCookie() {
    console.log('Cookie?' + navigator.cookieEnabled);
    var c_value = document.cookie;
    console.log(c_value);
    return c_value;
}


function tutorial() {
    var shadowRoot = $('#crowd-polygon')[0].shadowRoot;
    var headerButtonsContainer = $(".headerButtonsContainer", shadowRoot);
    var instructButton = $(":button", headerButtonsContainer).get(0);
    instructButton.click();

    var moreInstruction = $(".moreInstructionsLink", shadowRoot);
    console.log(moreInstruction);

    // window.open('https://sagemaker-studio-f5iy3bqk9dc.s3.us-east-2.amazonaws.com/user+interface/RP/instruction/tutorial.html');
    window.location.assign('https://sagemaker-studio-f5iy3bqk9dc.s3.us-east-2.amazonaws.com/user+interface/RP/Instruction/tutorial.html');
    // window.location.assign('Instruction/tutorial.html');
    // window.open('instruction/tutorial.html');
}
