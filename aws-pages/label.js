/*
* Scripts for Symmetry Labeling Interface
*/
// var img_urls = require("./demo_img_urls.json");
// var img_urls = [];
var img_urls = [
    // "../figures/images/1.jpg",
    "../figures/tutorial/Butterfly.jpg",
    "../figures/demo label images/new_label_000.jpg",
    "../figures/demo label images/new_label_001.jpg",
    "../figures/demo label images/new_label_002.jpg",
    "../figures/demo label images/new_label_003.jpg",
    "../figures/demo label images/new_label_004.jpg",
    "../figures/demo label images/new_label_005.jpg",
    "../figures/demo label images/new_label_006.jpg",
    "../figures/demo label images/new_label_007.jpg",
    "../figures/demo label images/new_label_008.jpg",
    "../figures/demo label images/new_label_009.jpg",
    "../figures/demo label images/new_label_010.jpg",
    "../figures/demo label images/new_label_011.jpg",
];
var img_id = 0;
var img_size = [];
var annos = [];
var sym_types = [];
var prev_XY = [];

var num_skipped = 0;
var num_labeled = 0;
var num_total = 0;

var active_list_bg_colors = { "rot": "rgba(255, 0, 0, 0.1)", "ref": "rgba(0, 255, 0, 0.1)" };

$(document).ready(function () {
    // * setup everything to get ready
    // $.getJSON("./demo_img_urls.json", { get_param: 'value' }, function(data) {

    //     img_urls = data["img_urls"];
    //     console.log(img_urls);
    // });

    // * setup updates to the arrangement
    $("div.container > div#instructions").html(
        `
        <h4 class="text-center"><b> Goal of the study: to find out how humans perceive symmetries in real
                            world scenes </b>
                    </h4>
                    <h5 class="text-center"> Note: Real world symmetries may <strong
                                style="color: red;font-size: 120%;">NOT</strong> appear
                        perfectly. </h5>
                    <h4> <b>Instructions:</b> </h4>
                    <ol>
                        <li>
                            Need a refresher on "<b>Symmetry</b>"? Copy and open this link: <a
                               href="https://alexis97.github.io/RP-Interface/pages/tutorial.html" target="_blank">
                                https://alexis97.github.io/RP-Interface/pages/tutorial.html</a>
                        </li>
                        <li> <b>Label every symmetry</b> you <b>perceive</b> on each image.</li>
                        <li> <b>Skipping an image</b> (not labeling) is OK if no perceived symmetries are found.</li>
                        <li> Choose which type of symmetry to be labeled first. </li>
                        <li> Do not use mobile device to view this page. </li>
                    </ol>
        `
    )


    // $($("div.label-panel > p")[0]).replaceWith("");

  

    $("div#body-part > div#actions").html(
        `
        <h4> <b>Actions:</b> </h4>
                        <ol>
                            <li>
                                <div class="thumbnail">
                                <p><button type="button" class="btn btn-lg dummy-button" disabled>Label SYMMETRY</button></p>
                                <!-- <h3><span class="label label-primary">LABEL SYMMETRY </span> </h3> -->
                                <!-- <h5>LABEL SYMMETRY </h5> -->
                                <div class="">
                                    <ul class="list-group" id="option-left">
                                        <a class="list-group-item" id="rot">-> Rotation center (one point/click)</a>
                                        <a class="list-group-item" id="ref">-> Reflection axis (two end points/clicks)</a>
                                    </ul>
                                </div>
                                </div>
                            </li>
                            <li> <p><button type="button" class="btn btn-lg btn-warning clear" id="left">Clear Last Label</button></p> </li>
                            <li> <p><button type="button" class="btn btn-lg btn-primary" id="skip">Skip This Image</button></p> </li>
                            <li> <p><button type="button" class="btn btn-lg btn-success" id="submit">Submit Your SYMMETRY Labels</button></p> </li>
                        </ol>
        `);

    $("a#rot").text("??? Rotation Symmetry: click one point (rotation center)");
    $("a#ref").text("??? Reflection Symmetry: click two points (reflection axis)");
    
    $("a#rot").css({ "background-color": active_list_bg_colors["rot"] });
    $("a#ref").css({ "background-color": active_list_bg_colors["ref"] });

    $("button.dummy-button").css({ "color": "white", "background-color": "#666060" });

    // * read the image url
    var img_url = $("#img-url").text();
    if (img_url != " {{ task.input.source-ref | grant_read_access }} ")
        img_urls = [img_url];
    console.log(img_urls);

    num_total = img_urls.length;

    // * setup list group active click events
    var options = $(".list-group .list-group-item");
    options.click(function () {
        $(this).addClass("active");
        $(this).css("background-color", "");
        $(this).siblings().removeClass("active");
        

        var id = -1;
        if ($(this).parent().attr('id') == "option-left")
            id = 0;
        else if ($(this).parent().attr('id') == "option-right")
            id = 1;

        if ($(this).attr('id') == "rot") {
            $(this).siblings().css({ "background-color": active_list_bg_colors["ref"]});
            sym_types[id] = "rot";
        }

        else if ($(this).attr('id') == "ref")
        {
            $(this).siblings().css({ "background-color": active_list_bg_colors["rot"]});
            sym_types[id] = "ref";
        }
            
    });



    // * setup image & canvas
    $(".labeling-tool").each((index, element) => {
        $(".bk-image")[index].src = img_urls[img_id];

        img_size[index] = [$(".bk-image")[index].width, $(".bk-image")[index].height];
        // setupCanvas(element, $(".bk-image")[index]);
        img_id += 1;
        // * init annotation & symmetry types: Rotation and Reflection
        annos.push({ "Rotation": [], "Reflection": [] });
        sym_types.push('None');
        prev_XY.push([-1, -1]);
    });

    $(".bk-image").on('load', function () {
        var canvas = $(this).siblings(".labeling-tool")[0];
        var index = getCanvasId(canvas);
        img_size[index] = [this.naturalWidth, this.naturalHeight];
        setupCanvas(canvas, this);
    });

    // * setup canvas draw functions
    $(".labeling-tool").mousedown(function (event) {
        // compute the relative coordinates in range [0,1]
        var relX = event.pageX - $(this).offset().left;
        var relY = event.pageY - $(this).offset().top;
        relX /= this.getBoundingClientRect().width;
        relY /= this.getBoundingClientRect().height;
        // console.log("Mouse down!" + "(" + relX + "," + relY + ")");

        // check the symmetry type
        var id = getCanvasId(this);

        if (sym_types[id] == "rot") {
            // draw a point for rotation symmetry
            drawPoint(this, relX, relY, color = 'red', board_color = 'yellow');
            addRotAnno(this, relX, relY);
        }
        else if (sym_types[id] == "ref") {
            // first, draw a point to indicate the line end
            drawPoint(this, relX, relY, color = 'green', board_color = 'yellow');

            // second, if this is the second click, draw a line for reflection symmetry
            if (prev_XY[id][0] == -1) {
                prev_XY[id] = [relX, relY];
            }
            else {
                drawLine(this, prev_XY[id][0], prev_XY[id][1], relX, relY, color = 'green', board_color = 'yellow');
                addRefAnno(this, prev_XY[id][0], prev_XY[id][1], relX, relY);
                prev_XY[id] = [-1, -1]
            }
        }
    });

    // * setup clear button
    $(".btn.clear").click(function () {
        // console.log(this);
        var id = -1;
        if (this.id == "left")
            id = 0;
        else if (this.id == "right")
            id = 1;

        clearLastLabel(id);
    });

    // * setup submit button
    $(".btn#submit").click(function () {
        $("crowd-form")[0].submit();
    });

    // * setup skip button
    $(".btn#skip").click(function () {
        img_id = initialVars(img_id);
        $("crowd-form")[0].submit();
    });

    // * setup panel div arrangement
    var panel_height = $(".label-panel").height()
    $(".submit-panel").height(panel_height);
    updateInfoBoard($("#info-board"));

    // * setup crowd-form submit 
    if ($("crowd-form").length > 0)
    {
        $("crowd-form")[0].onsubmit = function () {
            submit();
        };
    }
    


    // $(label_panel.children(".text-center")[1]).replaceWith(`<button type="button" class="btn btn-lg btn-primary" id="skip">Skip</button>`);
});

function initialVars(cur_img_id) {
    // * Initial variables
    img_size = []
    annos = []
    sym_types = []
    prev_XY = []

    $(".labeling-tool").each((index, element) => {
        $(".bk-image")[index].src = img_urls[cur_img_id];

        img_size[index] = [$(".bk-image")[index].width, $(".bk-image")[index].height];
        // setupCanvas(element, $(".bk-image")[index]);
        cur_img_id += 1;
        // * init annotation & symmetry types: Rotation and Reflection
        annos.push({ "Rotation": [], "Reflection": [] });
        sym_types.push('None');
        prev_XY.push([-1, -1]);
    });

    return cur_img_id;
}

function loadImgURLs(json_url) {
    $.getJSON(json_url, { get_param: 'value' }, function (data) {
        console.log(data);
        img_urls = data;
    });
}

function getCanvasId(canvas) {
    var id = -1;
    if (canvas.id == "canvas-left")
        id = 0;
    else if (canvas.id == "canvas-right")
        id = 1;

    return id;
}

function setupCanvas(canvas, img) {
    // * compute the suitable canvas size
    // get the height of all elements below the canvas
    var container = $(canvas).parent()[0];
    var below_height = 0;
    $(canvas).parent().nextAll().each((i, e) => {
        below_height += e.offsetHeight;
    });
    // console.log(below_height);

    var max_c_height = window.innerHeight - container.getBoundingClientRect().top - 30;
    var max_c_width = container.getBoundingClientRect().width;

    var w_ratio = max_c_width / img.naturalWidth;
    var h_ratio = max_c_height / img.naturalHeight;
    var ratio = Math.min(w_ratio, h_ratio);

    canvas.width = img.naturalWidth * ratio;
    canvas.height = img.naturalHeight * ratio;
    // console.log(canvas.width, canvas.height);

    $(img).css({
        "position": "absolute",
        "visibility": "visible", "z-index": -1,
        "left": `50%`,
        "margin-left": `-${canvas.width / 2}px`
    });

    img.width = canvas.width;
    img.height = canvas.height;
    // console.log(img.width, img.height);
}


function drawPoint(canvas, x, y, color = 'red', board_color = '', radius = 8, lineWidth = 4, boarder = 1) {
    // * draw a point on the canvas
    x *= canvas.width;
    y *= canvas.height;

    var ctx = canvas.getContext('2d');

    if (board_color != "") {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.lineWidth = lineWidth + boarder;
        ctx.strokeStyle = board_color;
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.stroke();
}

function drawLine(canvas, x1, y1, x2, y2, color = 'red', board_color = '', lineWidth = 4, boarder = 1) {
    // * draw a line on the canvas
    x1 *= canvas.width;
    y1 *= canvas.height;
    x2 *= canvas.width;
    y2 *= canvas.height;

    var ctx = canvas.getContext('2d');

    if (board_color != "") {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = lineWidth + boarder;
        ctx.strokeStyle = board_color;
        ctx.stroke();

    }

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.stroke();
}

function addRotAnno(canvas, relX, relY) {
    // * add a rotation annotation

    var id = getCanvasId(canvas);

    annos[id]["Rotation"].push([relX, relY]);
}

function addRefAnno(canvas, relX1, relY1, relX2, relY2) {
    // * add a reflection annotation

    var id = getCanvasId(canvas);

    annos[id]["Reflection"].push([relX1, relY1, relX2, relY2]);
}

function clearLastLabel(id) {
    // * remove the last annotation belongs to the selected Sym type
    // console.log("Clear " + id);
    if (sym_types[id] == 'rot') {
        annos[id]["Rotation"].pop();
    }
    else if (sym_types[id] == 'ref') {
        annos[id]["Reflection"].pop();
    }
    // console.log(annos);

    // redraw the canvas
    var canvas = $(".labeling-tool")[id];
    clearAll(canvas);

    annos[id]["Rotation"].forEach(element => {
        // console.log(element);
        drawPoint(canvas, element[0], element[1], strokeStyle = "red");
    });

    annos[id]["Reflection"].forEach(element => {
        drawPoint(canvas, element[0], element[1], strokeStyle = "green");
        drawPoint(canvas, element[2], element[3], strokeStyle = "green");
        drawLine(canvas, element[0], element[1], element[2], element[3], strokeStyle = "green");
    });
}

function clearAll(canvas) {
    // * clear all the annotations of a canvas
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);


}

function updateInfoBoard(infoboard) {
    // * update the info board: number of skipped images, number of labeled images, total images
    $(infoboard).children("#skipped").text("Skipped: " + num_skipped);
    $(infoboard).children("#labeled").text("Labeled: " + num_labeled);
    $(infoboard).children("#total").text("(Max: " + num_total + ")");
}

function submit() {
    // * submit the annotations for AWS Crowd

    console.log("Submit Annotations:");
    // annos.forEach((anno, id) => {
    //     console.log("\tImage " + id + " Rotation:");
    //     anno["Rotation"].forEach(element => {
    //         console.log(element);
    //     });
    //     console.log("\tImage " + id + " Reflection:");
    //     anno["Reflection"].forEach(element => {
    //         console.log(element);
    //     });
    // });

    $("#form").remove("input");
    var anno = annos[0];
    anno["Rotation"].forEach((element, index) => {
        $("#form").append(`<input name="Rotation ${index}" id="Rotation" type="hidden">`);
        $("input#Rotation")[index].value = element;
        console.log("\tRot" + index + ":" + $("input#Rotation")[index].value);
    });

    anno["Reflection"].forEach((element, index) => {
        $("#form").append(`<input name="Reflection ${index}" id="Reflection" type="hidden">`);
        $("input#Reflection")[index].value = element;
        console.log("\tRef: " + index + ":" + $("input#Reflection")[index].value);
    });

    // $("input#Rotation")[0].value = annos[0]["Rotation"];
    // $("input#Reflection")[0].value = annos[0]["Reflection"];
    // // console.log($("#annotations")[0].value);
    // $("#form").append(`<input name="New" id="New" type="hidden">`);
    // $("input#New")[0].value = "New";
}

