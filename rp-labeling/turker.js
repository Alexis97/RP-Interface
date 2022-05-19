let translateX, translateY, correctX, correctY;
let anchorX, anchorY, dragX, dragY, mouseX, mouseY;
let dragged, dragStart, delta, scaleRatio, scaleDiff;
let child, parent, canvas, ctx, img;
let annotations, classSelection;
let transparency_level = 0.5;
let dragOffsetX = 0;
let dragOffsetY = 0;
let scalingOffsetX = 0;
let scalingOffsetY = 0;
let oldScale = 1.0;
let newScale = 1.0;
let firstPoint = true;
let modes = ["bbox", "polygon"];
let mode = "";
let modeNum = 0;
let dotSize = 4;
let scaleTransform = 1;
let translateTransform = [0, 0];
let translateTransform_raw = [0, 0];
let delete_mode = false;
let delete_idx = -1;
let trashcan = new Array();
let colors = {};
let timeDownUp = null;
let rightClick = false;

let lineWidth = 4;

let classes = ["Recurring Pattern 1", "Recurring Pattern 2"];
let currentLink = { class: [], mode: "link", data: [] };
let currentPolygon = { class: [], mode: "polygon", data: [] };
let currentBbox = { class: [], mode: "bbox", data: [] };

$(document).ready(function () {

    parent = document.getElementById("parent");
    child = document.getElementById("child");
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    img = document.getElementById("pic");
    modeButton = document.getElementById("mode_button");

    canvas.width = img.width;
    canvas.height = img.height;
    canvas.style.cursor = "crosshair";

    $("#instruction").slideUp(0);

    $("#title").click(function () {
        $("#instruction").clearQueue();
        $("#instruction").slideToggle();
    });

    annotations_str = "${annotations}";
    if (annotations_str == "$" + "{annotations}") {
        annotations = [];
    } else {
        annotations_str = annotations_str.replace(/'/g, '"');
        annotations_str = annotations_str.replace(/;/g, ",");
        annotations = JSON.parse(annotations_str);
    }

    annotations.push = function (obj) {
        Array.prototype.push.call(annotations, obj);
    };

    annotations.splice = function (idx, numElements) {
        Array.prototype.splice.call(annotations, idx, numElements);
    };

    mode = modes[0];
    modeButton.value = "Mode: " + capitalize(mode);

    // * generate select list options
    classSelection = $("select#label_class")[0];
    setRPClass();

    // * initialize slider
    let slider = document.getElementById("transparency_slider");
    slider.oninput = function () {
        transparency_level = this.value / 100.0;
        updateGraphics();
    };

    // * initialize buttons
    $("#reset_button").click(reset);
    $("#reposition_button").click(reposition);
    $("#undo_button").click(undo);
    $("#mode_button").click(toggleMode);
    $("#delete_button").click(() => setDeleteMode(true));
    $("#annotate_button").click(() => setDeleteMode(false));

    // document.getElementById("submitButton").disabled = false;
    // document
    //     .getElementById("buttons")
    //     .appendChild(document.getElementById("submitButton"));

    child.addEventListener("DOMMouseScroll", handleScroll, false);
    child.addEventListener("mousewheel", handleScroll, false);

    // * disable right click context menu on canvas
    canvas.oncontextmenu = function () {
        return false;
    };

    $("img#pic").on('load', function () {
        var canvas = $(this).siblings("canvas")[0];
        setupCanvas(canvas, this);
    });

    canvas.addEventListener("mouseout", function (evt) {
        dragStart = false;
        dragged = false;
    });

    canvas.addEventListener("pointerdown", function (evt) {
        rightClick = evt == 3;
        getCorrectCoords(evt);
        timeDownUp = new Date().getTime();
        anchorX = evt.clientX;
        anchorY = evt.clientY;
        dragged = false;
        dragStart = true;
        if (mode == "bbox" && !rightClick && !getDeleteMode()) {
            currentBbox.class = getClass();
            currentBbox.data = new Array();
            currentBbox.data.push([correctX, correctY]);
        }
    });

    canvas.addEventListener("pointerup", function (evt) {
        timeDownUp = new Date().getTime();
        getCorrectCoords(evt);
        if (dragged) {
            if (mode == "bbox" && !rightClick) {
                currentBbox.data.push([correctX, correctY]);
                if (currentBbox.data.length == 2) {
                    annotations.push(Object.assign({}, currentBbox));
                }
                currentBbox.data = new Array();
            }
        } else {
            if (!rightClick) {
                if (getDeleteMode() == true) {
                    deleteAnnotation();
                } else {
                    updateAnnotation();
                }
            } else {
                currentBbox.data = new Array();
            }
        }

        rightClick = false;
        dragStart = false;
        updateGraphics();

        if (annotations.length == 0) {
            document.getElementById("coordinates").value = "";
        } else {
            document.getElementById("coordinates").value =
                JSON.stringify(annotations);
        }
    });

    canvas.addEventListener("mousemove", function (evt) {
        getCorrectCoords(evt);
        if (getDeleteMode() == true) {
            delete_idx = getDeleteIdx();
            updateGraphics();
        } else if (rightClick) {
            let timeMove = new Date().getTime();
            if (timeMove > timeDownUp) {
                if (dragStart) {
                    dragged = true;
                    dragX = evt.clientX - anchorX;
                    dragY = evt.clientY - anchorY;
                    translateTransform_raw = [
                        translateTransform_raw[0] + dragX,
                        translateTransform_raw[1] + dragY,
                    ];
                    translateTransform[0] = translateTransform_raw[0] / newScale;
                    translateTransform[1] = translateTransform_raw[1] / newScale;
                    updateTransform();
                    dragOffsetX += dragX;
                    dragOffsetY += dragY;
                    anchorX = evt.clientX;
                    anchorY = evt.clientY;
                }
            } else {
                timeDownUp = null;
            }
        } else if (mode == "bbox" && dragStart) {
            dragged = true;
            updateGraphics();
        } else if (mode == "link") {
            updateGraphics();
        }
    });
});

// end of ready function

function setRPClass(selectedIndex = 0){

    $(classSelection).html("");
    classes.forEach((theClass) => {
        let hue = Math.abs(theClass.hashCode() % 360) / 360;
        let color = [hue, 1.0, 1.0];
        $(classSelection).append(`<option>${theClass}</option>`)
        colors[theClass] = color;
    });

    classSelection.size = Math.min(10, classes.length);
    classSelection.selectedIndex = selectedIndex;
    updateGraphics();
}

function drawPolygonOutline(corners) {
    for (let j = 0; j < corners.length; j++) {
        ctx.fillRect(
            corners[j][0] - dotSize / 2,
            corners[j][1] - dotSize / 2,
            dotSize,
            dotSize
        );
    }
    ctx.beginPath();
    ctx.moveTo(corners[0][0], corners[0][1]);
    for (let j = 1; j < corners.length; j++) {
        ctx.lineTo(corners[j][0], corners[j][1]);
        ctx.stroke();
    }
    ctx.stroke();
    ctx.closePath();
}

function fillPolygon(corners) {
    ctx.beginPath();
    ctx.moveTo(corners[0][0], corners[0][1]);
    for (let j = 1; j < corners.length; j++) {
        ctx.lineTo(corners[j][0], corners[j][1]);
        ctx.stroke();
    }
    ctx.lineTo(corners[0][0], corners[0][1]);
    ctx.stroke();
    ctx.closePath();
    ctx.fill();
}

function toggleMode() {
    modeNum += 1;
    if (modeNum >= modes.length) {
        modeNum = 0;
    }
    setDeleteMode(false);
    mode = modes[modeNum];
    modeButton.value = "Mode: " + capitalize(mode);
    clearCurrentAnn();
}

function clearCurrentAnn() {
    currentBbox.data = new Array();
    currentLink.data = new Array();
    currentPolygon.data = new Array();
}

function deleteAnnotation() {
    if (delete_idx > -1) {
        let ann_copy = deep_copy(annotations[delete_idx]);
        trashcan.push(ann_copy);
        annotations.splice(delete_idx, 1);
        delete_idx = getDeleteIdx();
        if (annotations.length == 0)
            // no more to delete, go back to annotate mode
            setDeleteMode(false);
    }
}

function toggleDelete() {
    setDeleteMode(!getDeleteMode());
}

function getDeleteMode() {
    return delete_mode;
}

function setDeleteMode(deleteMode) {
    delete_mode = deleteMode;
    if (delete_mode == false) {
        // annotate mode
        canvas.style.cursor = "crosshair";
        $("#delete_button").removeClass("btn-primary");
        $("#delete_button").addClass("btn-outline-secondary");

        $("#annotate_button").removeClass("btn-outline-secondary");
        $("#annotate_button").addClass("btn-primary");
        updateGraphics();
    } else {
        // delete mode
        delete_idx = getDeleteIdx();
        canvas.style.cursor = "pointer";
        $("#annotate_button").removeClass("btn-primary");
        $("#annotate_button").addClass("btn-outline-secondary");

        $("#delete_button").removeClass("btn-outline-secondary");
        $("#delete_button").addClass("btn-primary");
        updateGraphics();
    }
}

function reset() {
    clearAnnotations();
    reposition();
    firstPoint = true;
    dragStart = false;
    dragged = false;
    setDeleteMode(false);
}

function reposition() {
    child.style.transform = "";
    scaleTransform = 1.0;
    translateTransform = [0, 0];
    translateTransform_raw = [0, 0];
    newScale = 1.0;
    oldScale = 1.0;
    scaleRatio = 1.0;
    scaleDiff = 0;
    dragOffsetX = 0;
    dragOffsetY = 0;
    scalingOffsetX = 0;
    scalingOffsetY = 0;
}

function updateAnnotation() {
    switch (mode) {
        case "dot": // dot mode
            annotations.push({
                class: getClass(),
                mode: "dot",
                data: [correctX, correctY],
            });
            break;
        case "link": // link mode
            currentLink.class = getClass();
            currentLink.data.push([correctX, correctY]);
            if (firstPoint) {
                firstPoint = false;
            } else {
                annotations.push(Object.assign({}, currentLink));
                currentLink.data = new Array();
                firstPoint = true;
            }
            break;
        case "polygon": // polygon mode
            currentPolygon.class = getClass();
            currentPolygon.data.push([correctX, correctY]);
    }
}

function clearAnnotations() {
    annotations = new Array();
    trashcan = new Array();
    currentLink = { class: [], mode: "link", data: [] };
    currentPolygon = { class: [], mode: "polygon", data: [] };
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function getClass() {
    return classSelection[classSelection.selectedIndex].innerHTML;
}

function getColor(annotation, options) {
    if (
        getDeleteMode() === true &&
        "idx" in options &&
        delete_idx === options.idx
    ) {
        return [0.5, 0.5, 0.5];
    } else {
        return className2Color(annotation.class);
    }
}

function drawDot(annotation, options) {
    const [r, g, b] = getColor(annotation, options);
    const corners = annotation.data;
    ctx.fillStyle = "rgba(" + r + "," + g + "," + b + ", 1.0)";
    ctx.lineWidth = lineWidth;
    ctx.fillRect(
        corners[0] - dotSize / 2,
        corners[1] - dotSize / 2,
        dotSize,
        dotSize
    );
}

function drawLink(annotation, options) {
    const [r, g, b] = getColor(annotation, options);
    const corners = annotation.data;
    ctx.fillStyle = "rgba(" + r + "," + g + "," + b + ", 1.0)";
    ctx.strokeStyle = "rgba(" + r + "," + g + "," + b + ", 1.0)";
    ctx.beginPath();
    ctx.moveTo(corners[0][0], corners[0][1]);
    if (options.current) {
        lastLocation = [correctX, correctY];
    } else {
        lastLocation = corners[1];
    }
    ctx.lineTo(lastLocation[0], lastLocation[1]);
    ctx.closePath();
    ctx.stroke();
    ctx.fillRect(
        corners[0][0] - dotSize / 2,
        corners[0][1] - dotSize / 2,
        dotSize,
        dotSize
    );
    ctx.fillRect(
        lastLocation[0] - dotSize / 2,
        lastLocation[1] - dotSize / 2,
        dotSize,
        dotSize
    );
}

function drawPolygon(annotation, options) {
    const [r, g, b] = getColor(annotation, options);
    const corners = annotation.data;
    ctx.fillStyle = "rgba(" + r + "," + g + "," + b + ", " + transparency_level + ")";
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = "rgba(" + r + "," + g + "," + b + ", 1.0)";
    if (options.current) {
        drawPolygonOutline(corners);
    } else {
        fillPolygon(corners);
    }
}

function drawBbox(annotation, options) {
    const [r, g, b] = getColor(annotation, options);
    ctx.fillStyle = "rgba(1, 1, 1, 0)";
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = "rgba(" + r + "," + g + "," + b + ", 1.0)";
    const xmin = annotation.data[0][0];
    const ymin = annotation.data[0][1];
    let xmax, ymax;
    if (options.current) {
        xmax = correctX;
        ymax = correctY;
    } else {
        xmax = annotation.data[1][0];
        ymax = annotation.data[1][1];
    }
    const corners = [
        [xmin, ymin],
        [xmax, ymin],
        [xmax, ymax],
        [xmin, ymax],
    ];
    fillPolygon(corners);
}

function updateGraphics() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    annotations.forEach((ann, idx) => {
        switch (ann.mode) {
            case "dot":
                drawDot(ann, { current: false, idx });
                break;
            case "link":
                drawLink(ann, { current: false, idx });
                break;
            case "polygon":
                drawPolygon(ann, { current: false, idx });
                break;
            case "bbox":
                drawBbox(ann, { current: false, idx });
        }
    });

    if (currentLink.data.length != 0) {
        drawLink(currentLink, { current: true });
    }

    if (currentPolygon.data.length != 0) {
        drawPolygon(currentPolygon, { current: true });
    }

    if (currentBbox.data.length != 0) {
        drawBbox(currentBbox, { current: true });
    }
}

// depending on mode, either undo deletion or undo annotation
function undo() {
    if (getDeleteMode() == true) {
        if (trashcan.length > 0) {
            annotations.push(trashcan.pop());
        }
    } else {
        switch (mode) {
            case "dot":
                annotations.pop();
                break;
            case "link":
                if (currentLink.data.length == 0) {
                    annotations.pop();
                } else {
                    currentLink.data = new Array();
                    firstPoint = true;
                }
                break;
            case "polygon":
                if (currentPolygon.data.length == 0) {
                    annotations.pop();
                } else {
                    currentPolygon.data.pop();
                }
                break;
            case "bbox":
                if (currentBbox.data.length == 0) {
                    annotations.pop();
                } else {
                    currentBbox.data = new Array();
                    dragStart = false;
                    dragged = false;
                }
        }
    }
    updateGraphics();
}

window.addEventListener(
    "keydown",
    function (evt) {
        // Press E for "Mode toggle"
        if (evt.key == "e") {
            toggleMode();
        }

        // Press ctrl + Z for "Undo"
        if (evt.key == "z" && evt.ctrlKey) {
            undo();
        }

        // Press D for "Delete"
        if (evt.key == "d") {
            toggleDelete();
        }

        // Press C for "Close Polygon"
        if (evt.key == "c") {
            if (currentPolygon.data.length > 2) {
                currentPolygon.class = getClass();
                annotations.push(Object.assign({}, currentPolygon));
                currentPolygon.data = new Array();
            }
            // Update coordinates
            if (annotations.length == 0) {
                document.getElementById("coordinates").value = "";
            } else {
                document.getElementById("coordinates").value =
                    JSON.stringify(annotations);
            }
        }
        updateGraphics();
    },
    true
);

let handleScroll = function (evt) {
    getCorrectCoords(evt);
    delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;

    newScale += delta / 10;
    newScale = Math.max(newScale, 1.0);
    newScale = Math.min(newScale, 5.0);
    scaleRatio = newScale / oldScale;
    scaleDiff = newScale - oldScale;
    oldScale = scaleTransform = newScale;

    scalingOffsetX = ((newScale - 1) * parent.offsetWidth) / 2;
    scalingOffsetY = ((newScale - 1) * parent.offsetHeight) / 2;

    translateTransform_raw[0] -=
        (correctX - parent.offsetWidth / 2) * scaleDiff;
    translateTransform_raw[1] -=
        (correctY - parent.offsetHeight / 2) * scaleDiff;

    translateTransform[0] = translateTransform_raw[0] / newScale;
    translateTransform[1] = translateTransform_raw[1] / newScale;
    updateTransform();
};

function updateTransform() {
    child.style.transform = "";
    child.style.transform +=
        "scale(" + scaleTransform + ", " + scaleTransform + ")";
    child.style.transform +=
        "translate(" +
        translateTransform[0] +
        "px, " +
        translateTransform[1] +
        "px)";
}

function getCorrectCoords(evt) {
    mouseX =
        evt.clientX - parent.offsetLeft + parent.scrollLeft + window.pageXOffset;
    mouseY =
        evt.clientY - parent.offsetTop + parent.scrollTop + window.pageYOffset;
    correctX = (mouseX + scalingOffsetX - translateTransform_raw[0]) / newScale;
    correctY = (mouseY + scalingOffsetY - translateTransform_raw[1]) / newScale;
    correctX = Math.round(correctX);
    correctY = Math.round(correctY);
}

function getDeleteIdx() {
    let deleteIdx = -1;
    let min_dist = 1000000;
    let dist_array = new Array();
    for (let i = 0; i < annotations.length; i++) {
        let ann = annotations[i];
        let corners = ann.data;
        switch (ann.mode) {
            case "dot":
                dist_array.push(getDist([correctX, correctY], corners));
                break;
            case "link":
                dist_array.push(get_avg_dist(corners));
                break;
            case "polygon":
                dist_array.push(get_avg_dist(corners));
                break;
            case "bbox":
                dist_array.push(get_avg_dist(corners));
        }
    }
    let dist;
    for (let i = 0; i < dist_array.length; i++) {
        dist = dist_array[i];
        if (dist < min_dist) {
            min_dist = dist;
            deleteIdx = i;
        }
    }
    return deleteIdx;
}

function getDist(pair_a, pair_b) {
    let distance = Math.sqrt(
        Math.pow(pair_a[0] - pair_b[0], 2) + Math.pow(pair_a[1] - pair_b[1], 2)
    );
    return distance;
}

function deep_copy(obj) {
    return jQuery.extend(true, {}, obj);
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function mean(array) {
    let total = 0;
    for (let j = 0; j < array.length; j++) {
        total += array[j];
    }
    let avg = total / array.length;
    return avg;
}

function get_avg_dist(corners) {
    let avg_dist_array = new Array();
    for (let j = 0; j < corners.length; j++) {
        avg_dist_array.push(getDist([correctX, correctY], corners[j]));
    }
    return mean(avg_dist_array);
}

String.prototype.hashCode = function () {
    let hash = 0;
    for (let i = 0; i < this.length; i++) {
        hash += Math.pow(this.charCodeAt(i) * 31, this.length - i);
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};

function HSVtoRGB(h, s, v) {
    // Borrowed from https://stackoverflow.com/a/17243070/4970438
    let r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        (s = h.s), (v = h.v), (h = h.h);
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0:
            (r = v), (g = t), (b = p);
            break;
        case 1:
            (r = q), (g = v), (b = p);
            break;
        case 2:
            (r = p), (g = v), (b = t);
            break;
        case 3:
            (r = p), (g = q), (b = v);
            break;
        case 4:
            (r = t), (g = p), (b = v);
            break;
        case 5:
            (r = v), (g = p), (b = q);
            break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    };
}

function className2Color(className) {
    let color = colors[className];
    let h = color[0];
    let s = color[1];
    let v = color[2];
    let rgbColors = HSVtoRGB(h, s, v);
    let r = rgbColors.r.toString();
    let g = rgbColors.g.toString();
    let b = rgbColors.b.toString();
    return [r, g, b];
}