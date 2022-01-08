/*
* JS scripts for MyUI-RPLabeling (Local Version)
* Version 3: update on 05/21
*/


var id = 2;

var newUser = true;

function GetShadowRoot()
{
    var shadowRoot = $('#annotator')[0].shadowRoot;
    return shadowRoot;
}

var shadowRoot = GetShadowRoot();


document.addEventListener('all-crowd-elements-ready', function () {
    console.log("all crowd elements ready!");
    DefineLayout();
    SetInstruction();

    ActivateInstruction();
    DisableShortCut();

    // PopulateLabelsSection(labelsSection, annotator);

    $("crowd-form").submit(function () {
        console.log("Thank you for your comment!");
        console.log($("crowd-tool")[0].value);
    });

    ListenLabelButton();
});

function alertFunc() {
    alert("Hello!");
}

/*
* Function to define the layout
*/
function DefineLayout() {
    $('head').append('<link rel="stylesheet" type="text/css" href="style.css">');
    // $('head').append('<link rel="stylesheet" type="text/css" href="https://sagemaker-studio-f5iy3bqk9dc.s3.us-east-2.amazonaws.com/user+interface/RP/style.css">');
    // $('#container').addClass('col-10');
    $('form').css('display', 'inherit');
    return
}

/*
* Set the Full instruction part
*/
function SetInstruction()
{
    var req = new XMLHttpRequest();
    req.onload = function (e) {
        fullInstructions.innerHTML = e.target.response;
    };
    
    req.open("GET", "instruction/full-instruction.html", true);
    // req.open("GET", "https://sagemaker-studio-f5iy3bqk9dc.s3.us-east-2.amazonaws.com/user+interface/RP/full-instruction.html", true);
    req.send();
}

/*
* Activate the instruction panel
*/
function ActivateInstruction()
{
    var shadowRoot = GetShadowRoot();
    var headerButtonsContainer = $(".headerButtonsContainer", shadowRoot);
    var mybutton = $(":button", headerButtonsContainer).get(0);
    mybutton.click();
}

/*
* Disable the shortcut button
*/
function DisableShortCut()
{
    var headerButtonsContainer = $(".headerButtonsContainer", GetShadowRoot()).get(0);
    console.log(headerButtonsContainer);
    headerButtonsContainer.style.display="none";

    // var button1 = $(":button", headerButtonsContainer).get(0);
    // var button2 = $(":button", headerButtonsContainer).get(1);
    // console.log(button2);
    // button1.style.display = "none";
    // button2.style.display = "none";
}

/*
* Listen to Label Button
*/
function ListenLabelButton()
{
    var shadowRoot = GetShadowRoot();
    var labelPane = $(".label-pane-content", shadowRoot);
    console.log(labelPane);
    $(".label-pane-content", shadowRoot).on('click', 'label-button selected', function(){
        console.log("Click Label!");
    });

}

/*
* Design the RP Buttons
*/
function DesignRPButtons(container) {
    // button part
    var dummyButton = document.createElement("crowd-button");     // a dummy button to avoid warnings 
    dummyButton.style.display = "none";

    var addRPButton = document.createElement("crowd-button");
    addRPButton.id = "addButton";
    addRPButton.innerHTML = "Add an RP";
    addRPButton.classList.add('label-button');

    var deleteRPButton = document.createElement("crowd-button");
    deleteRPButton.id = "addButton";
    deleteRPButton.innerHTML = "Delete an RP";
    deleteRPButton.classList.add('label-button');

    container.append(dummyButton);
    container.append(addRPButton);
    container.append(deleteRPButton);

    // bind click functions
    addRPButton.onclick = function () {
        id = AddLabel(labelsSection, crowdRoot, id);
    };
}

/*
* Functions to add a label
*/
addRP.onclick = function () {
    id = AddLabel(annotator, id);
};

function AddLabel(crowdRoot, id) {
    console.log("Click Add Button!");
    crowdRoot.labels = crowdRoot.labels.concat(['Recurring Pattern ' + id]);
    id += 1;

    // for category focus checking
    // $('div.label-button', shadowRoot).click(alertFunc());
    // PopulateLabelsSection(labelsSection, crowdRoot)
    return id;
}

/*
* Function to remove a label
*/
deleteRP.onclick = function () {
    DeleteLabel(annotator);
};

function DeleteLabel(crowdRoot) {
    console.log("Click Remove Button!");

    var labels = $(".label-button", GetShadowRoot());
    var label_idx = -1;
    for (let i=0;i<labels.length;i++)
    {
        var classList = labels.get(i).classList;
        if (classList.length>1 && classList[1] == "selected") 
        {
            var temp = crowdRoot.labels;
            temp.splice(i,1); 
            console.log(temp);
            crowdRoot.labels = [];
            for (let j=0;j<temp.length;j++)
            {
                crowdRoot.labels = crowdRoot.labels.concat(temp[j]);
            }
            // console.log(crowdRoot.labels);
        }
    }

    crowdRoot.labels = crowdRoot.labels;
}

addInst.onclick= function () {
    var polyButton = $("button#polygon", GetShadowRoot());
    polyButton.trigger( "click" );
};

deleteInst.onclick= function () {
    var deleteButton = $("button#delete", GetShadowRoot());
    deleteButton.trigger( "click" );
};

function recoverLabel(crowdRoot, id) {
    console.log("Click Recover Button!");
    crowdRoot.labels = '';
    for (var i = 2; i < id; i++) {
        crowdRoot.labels = crowdRoot.labels.concat(['Recurring Pattern ' + (i - 1).toString()]);
    }

    console.log(crowdRoot.labels)

    return id;
}

// function PopulateLabelsSection(labelsSection, crowdRoot) {
//     labelsSection.innerHTML = '';
//     crowdRoot.labels.forEach(function (label) {
//         const labelContainer = document.createElement('div');
//         labelContainer.innerHTML = label + ' <a href="javascript:void(0)">(Delete)</a>';
//         labelContainer.querySelector('a').onclick = function () {
//             crowdRoot.labels = crowdRoot.labels.filter(function (l) {
//                 return l !== label;
//             });
//             PopulateLabelsSection(labelsSection, crowdRoot);
//         };
//         labelsSection.appendChild(labelContainer);
//     });
// }

function checkFocus() {
    var focus = document.activeElement;
    console.log(focus);
    focus.blur();
}

function switchTool() {
    var curLabelTool = $('#annotator');
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
    var shadowRoot = $('#annotator')[0].shadowRoot;
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
