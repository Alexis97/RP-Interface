// * Rewrite the content of a container

let tutorial_url = "tutorial/tutorial.html";
let example_toy_url = "tutorial/example_toy.html";
let example_real_url = "tutorial/example_real.html";
let example_results_url = "tutorial/example_results.html";
let instructions_url = "tutorial/instructions.html";
let test_1_url = "tutorial/test_1.html";
let test_2_url = "tutorial/test_2.html";
let test_3_url = "tutorial/test_3.html";
let test_4_url = "tutorial/test_4.html";

let survey_url = "survey.html";
let sym_label_url = "sym_label.html";

function rewrite(container, url){
    // console.log("rewrite!");
    let req = new XMLHttpRequest();
    req.onload = function (e) {
        container.html(e.target.response);

    };
    req.open("GET", url);
    req.send();
}

$("a#tutorial").click(function () {
    $("div#container").addClass("container");
    $("div#container").removeClass("container-fluid");
    rewrite($("div#container"), tutorial_url);
});


$("a#example-toy").click(function () {
    $("div#container").addClass("container");
    $("div#container").removeClass("container-fluid");
    rewrite($("div#container"), example_toy_url);
});

$("a#example-real").click(function () {
    $("div#container").addClass("container");
    $("div#container").removeClass("container-fluid");
    rewrite($("div#container"), example_real_url);
});

$("a#example-results").click(function () {
    $("div#container").addClass("container");
    $("div#container").removeClass("container-fluid");
    rewrite($("div#container"), example_results_url);
});

$("a#instructions").click(function () {
    $("div#container").addClass("container");
    $("div#container").removeClass("container-fluid");
    rewrite($("div#container"), instructions_url);
});

$("a#test-1").click(function () {
    $("div#container").removeClass("container");
    $("div#container").addClass("container-fluid");
    rewrite($("div#container"), test_1_url);
});

$("a#test-2").click(function () {
    $("div#container").removeClass("container");
    $("div#container").addClass("container-fluid");
    rewrite($("div#container"), test_2_url);
});

$("a#test-3").click(function () {
    $("div#container").removeClass("container");
    $("div#container").addClass("container-fluid");
    rewrite($("div#container"), test_3_url);
});

$("a#test-4").click(function () {
    $("div#container").removeClass("container");
    $("div#container").addClass("container-fluid");
    rewrite($("div#container"), test_4_url);
});


$("a#survey").click(function () {
    $("div#container").addClass("container");
    $("div#container").removeClass("container-fluid");
    
    rewrite($("div#container"), survey_url);
});

$("a#sym-label").click(function () {
    $("div#container").removeClass("container");
    $("div#container").addClass("container-fluid");
    rewrite($("div#container"), sym_label_url);
});