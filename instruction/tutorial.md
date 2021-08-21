# Welcome to Discover Recurring Pattern with Us!
## Let's get started with Recurring Pattern!
### What is "Recurring Pattern"?
To answer this fundamental question, let's firstly take a look at some examples:

![image with RP of: Man-made rigid, Man-made deformable, Painting, Animal, Human](https://sagemaker-studio-f5iy3bqk9dc.s3.us-east-2.amazonaws.com/user+interface/RP/Instruction/figures/RPs.png)

These milk bottles, chip bags, paintings, animals and even human beings share quite a lot in common.
Specifically, there are a series of **instances** which share similar appearance and geometric properties in each image.
A **recurring pattern (RP)** is an ensemble of similar yet not necessarily identical **instances** in an image.

It is trivial to notice that any RP should contain **two or more instances**, otherwise a single instance can hardly to tell similar or not. 

### What is "Instance"?
We shall be very careful to use the term of "instance" here to avoid any ambiguity. 
- Instance could be a whole region of a box, animal, human beings, and etc. ![image here](https://sagemaker-studio-f5iy3bqk9dc.s3.us-east-2.amazonaws.com/user+interface/RP/Instruction/figures/obj-case1.png)
- It could also be a just part of  a visual area which distinctive features, like a legend on a plastic bag, a pice of a beautiful snow flower, and etc.![image here](https://sagemaker-studio-f5iy3bqk9dc.s3.us-east-2.amazonaws.com/user+interface/RP/Instruction/figures/obj-case2.png)

The reason we allow partial region to be considered as instance is to broader the horizon of RP discovery. You are welcome to label both large-scale similar stuff together, and also fine-grained similar pattern together for each RP, as figure shows. 

![example: two levels of RP labeling](https://sagemaker-studio-f5iy3bqk9dc.s3.us-east-2.amazonaws.com/user+interface/RP/Instruction/figures/2level-labeling.jpg)

### Is there any standard for labeling RP?
The answer is: **No**! You can feel free to label any thing that looks similar from your own perception. The only requirement is to label *at least two instances* for each recurring pattern, as we talked above.

## How to Label RP with the interface?
### Introduction of the UI layouts
![UI figure here](https://sagemaker-studio-f5iy3bqk9dc.s3.us-east-2.amazonaws.com/user+interface/RP/Instruction/figures/UI.png)
- The left part (in <span style="color:green">green</span>) is a pre-defined canvas with toolbox provided by Amazon Sagemaker Service. 
It is a user-friendly interface and you may click the "shortcuts" button for more keyboard interactions.

- The right part (in <span style="color:red">red</span>) is a RP panel containing RP based functionalities, including:
  - "Add Label" button: to add a new RP label named as *"Recurring Pattern x"*, which provides the functionality to label multiple groups of RP in one image.
  - "I'm a novice" button: to open a tutorial page for first time user to get started with RP labeling task.
  - A list contains all the RP labels: each provide with a *delete* link to remove the RP you unwanted.

### A demo video about a whole process of RP labeling task

<center>
    <video class="demoVideo"
            style = "max-width: 100%"
            src="https://sagemaker-studio-f5iy3bqk9dc.s3.us-east-2.amazonaws.com/instructions/demo_0702.mp4"
            type="video/mp4" controls>
        <p>Video not available on current browser.</p>
    </video>
</center>

## A simple test before you get started!
[The test page is under construction now. Will be released later.]