---
layout: post
title:  "Perlin Noise"
date:   2015-04-30 17:10:00
categories: algorithms
---

## Background (Noise)

Inspired by [this game's][no-mans-sky] open, procedurally-generated world, I decided do some experiments in generating terrain.  I learned pretty quickly that if you want to generate natural looking terrain, you're going to need noise.

The first name in noise is [Ken Perlin][ken-perlin]. Dr. Perlin invented a number of algorithms to generate noise, but his most famous is Perlin Noise.  He even won an Oscar for it.

You'll find tons of implementations of Perlin Noise on the Internet in just about any language you want.  In fact, it seems that Perlin Noise is considered pretty simple to implement.  Unfortunately, I'm no Ken Perlin. This algorithm was really hard for me to understand, even after looking at Perlin's own implementation and several explainer articles for mortals. So, I've written this up for those of us who need a little extra help groking Perlin Noise.

I'm going to avoid mathematical jargon and use pictures and analogies as much as possible. Only the most necessary concepts will be explained. I encourage you to look into Linear Algebra if you want a more sophisticated understanding of Perlin Noise and computer graphics in general. I'll be doing the same. [Khan Academy][khan-academy] is a great resource.

In the likely event that you're smarter than me, check out the links in the resources section.  They will probably get you going faster than this article.

## What's Noise?

When I think of noise the first thing I think of is a lot of disorganized sound. In the context of computer graphics, noise means a lot of disorganized pixels.  This is great for simulating natural structures because Mother Nature tends to be messy and color outside of the lines. To make a picture that looks noisy we use random numbers to select the color and position of each pixel.

Kind of.

Computers can't really pick random numbers.  That's because computers are deterministic and deterministic processes can't yield truly random numbers.  Fortunately, there are algorithms that can produce sequences of numbers that have the same statistical properties as random numbers.  These are called pseudo-random number generators. If you feed a pseudorandom number generator the same starting number (called a seed), it will give you the same sequence of pseudo-random numbers.  This property of pseudorandom number generators is extremely important for Perlin Noise, as we will see.

JavaScript's random number function *Math.random()* doesn't let you supply a seed. It uses the system's time as a seed.  So, it's no good to us. Instead we'll use Victor Quinn's excellent library [Chance.js][chancejs] which does let us supply a seed. It also uses a pseudo-random algorithm called the "Mersenne Twister".  How fun is that?

From here on out, when I say random, I really mean pseudo-random.

#Non-Coherent Noise

Let's see what it looks like when you randomly select the color of each pixel from among seven colors.  

{%highlight javascript%}
function NonCoherentNoise(){
  var Colors = ["red","green","blue","yellow","white","orange","black"];
  var c=document.getElementById("noncoherentnoise");
  var ctx=c.getContext("2d");
  var rnd = new Chance(42);

  for (var y = 0; y < 200; y = y + 2){
    for (var x = 0; x < 200; x = x + 2){
      ctx.fillStyle = Colors[rnd.integer({min: 0, max: 6})];
      ctx.fillRect(x,y, 2, 2);
    }
  }
}
{%endhighlight%}

Here's the output of the above function:

<canvas id="noncoherentnoise" width="200" height="200" style="border: 1px solid black;"></canvas>


I think you'll agree that this doesn't look like anything in Nature except for maybe clown vomit. This is white noise.  White noise is a kind of noise where the values change independently from point to point. White noise is *very* noisy.  Too noisy in fact. The easiest way to visualize this is with a graph. Let's take the top row pixels in our white noise picture and graph the random number associated with the color against the pixel number.

<div id="noncoherentnoisechart" style="width: 700px; height: 400px"></div>

See how spiky that graph is? That's not what we want.  We want the values to change smoothly from point to point.

#Coherent Noise

Noise that changes smoothly from point to point is called coherent noise.  To think about how we might make coherent noise, let's consider a picture whose pixels change smoothly from point to point, but isn't noisy.

We'll make a picture that varies how blue the pixels are along the x axis using the *Math.sin()* function.

{%highlight javascript%}
function SineContour(){

  var c=document.getElementById("sinecontour");
  var ctx=c.getContext("2d");

  //the period of the sine wave
  var Period = 10;

  var blue_val = 0;
  var x_sin = 0;

  for (var y = 0; y < 200; y = y + 2){
    for (var x = 0; x < 200; x = x + 2){
      x_sin = Math.sin(x / Period);
      //calcuate a blue value between 195 and 255
      blue_val = Math.abs(Math.floor(195 + (x_sin * 60)));
      ctx.fillStyle = "rgba(0,0," + blue_val + ",1)";
      ctx.fillRect(x,y, 2, 2);
    }
  }
{%endhighlight%}

Here's what the output of SineContour looks like:

<canvas id="sinecontour" width="200" height="200" style="border: 1px solid black;"></canvas>

And here is a graph of the amount of blue in the pixels on the first row of the picture.

<div id="sinecontourchart" style="width: 700px; height: 400px"></div>

That's nice and smooth, but it's not noise! Now let's have a go at making a picture that's both smooth and noisy.

##Simple Gradient Noise

To do that, we'll use a trick that we'll see again when we talk about Perlin Noise.  Instead of picking a random value for each and every point, we'll pick a few random values evenly spaced throughout the picture.  Let's call this arrangement of points a *grid* and each point a *grid point*.  Then let's find a way to calculate a color at any point between these grid points.

If you pick any point on the picture, it will be surrounded by grid points.  Imagine that the colors between these points fade smoothly from one grid point to another.  To do that can make the color value of our chosen point a weighted average of the smooth fade from each of the surrounding grid points.


Let's see that in code.

{%highlight javascript%}
$.fn.SimpleGradientNoise = function(){

  var ctx= this[0].getContext("2d");
  var rnd = new Chance(42);

  /* we'll have a grid point spaced every ten pixels. That's 100 grid points
  for the whole picture. */

  //STEP 0: Setup

  var grid_point_spacing = 10;
  var pixel_size = 2;
  var gunit = grid_point_spacing * pixel_size;

  //grid point random numbers
  var gprn = [];

  for(var i = 0; i < 120; i++){
    gprn[i] = rnd.floating({min: 0, max: 1});
  }

  function lerp(v0, v1, t) {
    return v0 + t*(v1-v0);
  }

  function hash_xy(x,y){
    var hx = x / gunit;
    var hy = y / gunit;
    var hash = hx + (hy * 10);
    return hash;
  }

  var X0, X1, Y0, Y1 = 0;


  for (var y = 0; y < 200; y = y + pixel_size){
    for (var x = 0; x < 200; x = x + pixel_size){

      //STEP 1: Calculate the Surrounding Grid Points

      //figure out what the surrounding grid points are
      var X0 = Math.floor(x / gunit) * gunit;
      var X1 = X0 + gunit;
      var Y0 = Math.floor(y / gunit) * gunit;
      var Y1 = Y0 + gunit;

      //STEP 2: Look up the random values


      var rnd0 = gprn[hash_xy(X0,Y0)];
      var rnd1 = gprn[hash_xy(X1,Y0)];
      var rnd2 = gprn[hash_xy(X1,Y1)];
      var rnd3 = gprn[hash_xy(X0,Y1)];

      //Step 3: Calculate Where the Point is in the Unit Square

      var dist_x = (x - X0) / gunit;
      var dist_y = (y - Y0) / gunit;


      //Step 4: Use Linear Interpolation to Get a Weighted Average

      var lrp1 = lerp(rnd0,rnd1,dist_x);
      var lrp2 = lerp(rnd3,rnd2,dist_x);
      var color_scale = lerp(lrp1,lrp2,dist_y);

      //Step 5: Calculate the Blue Value of Calculated Weight
      var blue_val = Math.round(color_scale * 255);


      ctx.fillStyle = "rgba(0,0," + blue_val + ",1)";
      ctx.fillRect(x,y, 2, 2);
    }
  }
  return this;
}

{%endhighlight%}

Here is the output of the above function.

<canvas id="simplegradientnoise" width="200" height="200" style="border: 1px solid black;"></canvas>

Now we are making some progress! That's both smooth and noisy. Let's go through simple gradient noise step-by-step, because Perlin Noise is just an enhanced kind of gradient noise.  We'll be changing this function later to make it generate Perlin Noise instead of simple gradient noise, so it's important that we understand simple gradient noise first.

#Step 0: Setup

In Step 0 we set up a few helper functions and structures.

These lines establish the size of our grid.  We'll place grid points 10 "pixels" apart.  I use quotes here because they aren't really pixels.  Instead I'm using a 2x2 square to represent a pixel so they are easier to see.

{%highlight javascript%}
var grid_point_spacing = 10;
var pixel_size = 2;
{%endhighlight%}

So if you multiply the grid spacing by the pixel size you will get the *unit size* of the grid (20px).

{%highlight javascript%}
//this is the size of our unit squares.
var gunit = grid_point_spacing * pixel_size;
{%endhighlight%}

Let's take a minute to talk about what I mean by "unit size". Since our grid points are evenly spaced around the picture, they form squares whose corners are the grid points. It's convenient to think of each one of these squares as having side of one unit in length.  We can convert from unit length to pixels by multiplying the units by *gunit* or from pixels to units by dividing by *gunit*.

Next we need to make a list of random numbers between 0 and 1.  One will represent the maximum amount of blue that a pixel can be and zero will represent the minimum.

{%highlight javascript%}
/* Make an array of random numbers, which will be assigned to each grid point.
   We will use a hash function (hash_xy below) to map any particular grid point
   x/y coordinate to a random number between 0 and 1 */

var gprn = [];

for(var i = 0; i < 110; i++){
  gprn[i] = rnd.floating({min: 0, max: 1});
}
{%endhighlight%}

Next, we define a hash function that will let us take the x and y coordinates of any grid point and it will return an index that we can use to look up its associated random number in the array that we just created.

{%highlight javascript%}
/* This function takes an x and y coordinate and returns an index into the
   array of random numbers we made above. X and y come in as real coordinates,
   so we must divide them by the unit length to get a count of array elements for
   each dimension.  To compute the hash we multiply the y value by 10 to "wrap"
   the array around the y axis and then add in the x offset. */

function hash_xy(x,y){
  var hx = x / gunit;
  var hy = y / gunit;
  var hash = hx + (hy * 10);
  return hash;
}
{%endhighlight%}

Now we define a helper function to perform linear interpolation:

{%highlight javascript%}
//this function performs linear interpolation, explained below.
function lerp(v0, v1, t) {
  return v0 + t*(v1-v0);
}
{%endhighlight%}

Linear interpolation is the mathematical operation that we use to make a value change smoothly from point to point.  It is responsible for the smoothness of gradient noise compared with white noise.  Gradient noise gets its name from the fact that a series of numbers which change smoothly between two values is called a gradient.  Let's explore how this is done.

The *lerp* function takes three parameters:

* v0: a *y* value of the starting point. The *x* value for this *y* is defined as 0. Call this p0.
* v1: a *y* value of the ending point. The *x* value for this *y* is defined to be 1. Call this p1.
* t: an *x* value along the line between p0 to p1. *t* is given a value between 0 and 1.  We can think about this in the same way we think about the unit length of our grid.  Or if we like we can think of the value of *t* as being the percentage of distance along the line from p0 to p1.

*lerp* returns the *y* value associated with *t*.

Study this diagram and compare it to the Figure 1 at the head of this section.


{% include figure.html src="/img/linear_interpolation.png" caption="Figure 1: Linear Interpolation" %}


Given the definitions above,  point (t,L) is given be the equation:

<div style="margin:10px;">
  <math>
    <mfrac>
      <mn>L - v0</mn>
      <mn>t - v0</mn>
    </mfrac>
    <mo>=</mo>
    <mfrac>
      <mn>v1 - v0</mn>
      <mn>1 - 0</mn>
    </mfrac>
  </math>
</div>

Now since 1 - 0 = 1 and any number divided by 1 is itself, we can simplify the right hand side of the equation:

<div style="margin:10px;">
  <math>
    <mfrac>
      <mn>L - v0</mn>
      <mn>t - v0</mn>
    </mfrac>
    <mo>=</mo>
    <mn>v1 - v0</mn>
  </math>
</div>

Since both the top and the bottom of the left hand side of the equation are subtracted from v0, we can simplify:

<div style="margin:10px;">
  <math>
    <mfrac>
      <mn>L - v0</mn>
      <mn>t</mn>
    </mfrac>
    <mo>=</mo>
    <mn>v1 - v0</mn>
  </math>
</div>

Let's multiply both sides by t to simply further.

<div style="margin:10px;">
  <math>
      <mn>L - v0</mn>
    <mo>=</mo>
    <mn>t</mn>
    <mo>x</mo>
    <mn>v1</mn>
    <mo>-</mo>
    <mn>t</mn>
    <mo>x</mo>
    <mn>v0</mn>
  </math>
</div>

Now we add v0 to solve for L.

<div style="margin:10px;">
  <math>
      <mn>L</mn>
    <mo>=</mo>
    <mn>v0</mn>
    <mo>+</mo>
    <mn>t</mn>
    <mo>x</mo>
    <mn>v1</mn>
    <mo>-</mo>
    <mn>t</mn>
    <mo>x</mo>
    <mn>v0</mn>
  </math>
</div>

Simplify that a bit by changing t\*v1 - t\*v0 into t\*(v1 - v0).  Now our equation is:

<div style="margin:10px;">
  <math>
      <mn>L</mn>
    <mo>=</mo>
    <mn>v0</mn>
    <mo>+</mo>
    <mn>t</mn>
    <mo>x</mo>
    <mo>(</mo>
    <mn>v1</mn>
    <mo>-</mo>  
    <mn>v0</mn>
    <mo>)</mo>
  </math>
</div>


#Step 1: Calculate Surrounding Grid Points

{%highlight javascript%}
var X0 = Math.floor(x / gunit) * gunit;
var X1 = X0 + gunit;
var Y0 = Math.floor(y / gunit) * gunit;
var Y1 = Y0 + gunit;
{%endhighlight%}

First we divide the x and y by gunit to find how many units along each dimension we are. We use JavaScript's floor function to drop whatever pixels we have remaining over an even multiple of *gunit*.  Now we just multiply that number by gunit to convert the dimension back to pixels.

That gives us the point (X0,Y0), the top left corner of the our unit square. The other components are just one *gunit* away.  So just add *gunit* to X0 and Y0 to produce X1 and Y1.  With these four components, we can produce the coordinates of all four corners of the unit square:

* (X0,Y0)
* (X1,Y0)
* (X0,Y1)
* (X1,Y1)

#Step 2: Look Up Random Values

The hash function *hash_xy* produces a unique index into the array of random numbers *gprn*.  So, we pass in the x and y coordinates of each corner of the unit square we are in and get out the associated random number.

{%highlight javascript%}
var rnd0 = gprn[hash_xy(X0,Y0)];
var rnd1 = gprn[hash_xy(X1,Y0)];
var rnd2 = gprn[hash_xy(X1,Y1)];
var rnd3 = gprn[hash_xy(X0,Y1)];
{%endhighlight%}

#Step 3: Calculate Where the Point is in the Unit Square

To figure out where we are in the unit square, we just need to perform the substractions as shown below.  

{% include figure.html src="/img/calculate_unit_square.png" caption="Figure 2: Find the Position in the Unit Square" %}

And the code:

{%highlight javascript%}
var dist_x = (x - X0) / gunit;
var dist_y = (y - Y0) / gunit;
{%endhighlight%}

#Step 4: Use Linear Interpolation to Get an Average Influence Strength

Now we user linear interpolation (as described above) to combine the gradients for all four corners.  Refer to the diagram below to see how this is done.

{% include figure.html src="/img/gradient_noise.png" caption="Figure 3: Weighted Average by Linear Interpolation" %}


The corners of the square are the grid points surrounding point we've chosen (the red cirlce). The length of the green lines coming from the corners represent the random number we've assigned to each grid point.  The red lines depict a smooth transition between each of the grid points. Imagine we draw a straight line from  our point to the top and bottom edges of square formed by the grid points.  This is represented by the horizontal dotted blue lines.  Using this procedure we can pick two points, one on each of  the red interpolation lines along the top and bottom side of the square.  Now we draw a straight line between those two points, the orange line.  Lastly, we pick the point on the orange line that is right over our chosen point.  The height of the line going to that point represents an average of the random values assigned to the surrounding grid points.

And here's the code:

{%highlight javascript%}
var lrp1 = lerp(rnd0,rnd1,dist_x);
var lrp2 = lerp(rnd3,rnd2,dist_x);
var color_scale = lerp(lrp1,lrp2,dist_y);
{%endhighlight%}

Match up the *lerp* calls to the points they generate in Figure 3.

#Step 5: Step 5: Calculate the Blue Value of Calculated Weight

color_scale will give us a value between 0 and 1.  Let's multiply that by 255 and round it off.  That's how much blue we have at that point.

{%highlight javascript%}
var blue_val = Math.round(color_scale * 255);
{%endhighlight%}

That's all!

#Simple Gradient Noise Isn't Enough

Simple Gradient Noise is OK, but not really great. You can see ugly artifacts along the edges of some of the unit squares.  Perlin Noise provides more natural looking gradient noise with fewer artifacts along the edges of the unit squares.

It does this buy adding two things to simple gradient noise, which will be discussed in detail below:

* The use of *vectors* instead of scalar values at the grid points along with an algorithm that varies the size of the influence at the grid points.

* The use of an ease function to blend in the edges of the gradients.


##Perlin Noise

# Gradient Vectors

Simple Gradient Noise uses a fixed number (a [scalar](http://mathworld.wolfram.com/Scalar.html) because it only has magintude) at each grid point to represent the strength of the influence at that point. No matter where a point is inside of a unit square, the magnitude of the influence at a particular grid point is the same.  How strongly a grid point influences the color of a pixel depends only on how far away it is from the grid point.

Not so with Perlin Noise!  Perlin Noise uses a [vector](http://mathworld.wolfram.com/Vector.html) assigned to each grid point instead of a scalar value. The magnitude of the influence a grid point has over a point inside the unit square *varies*.  It depends how far away the point is from the grid point AND the angle between the vector going from the grid point to the point and the random vector assign to that point.  That last sentence was a mouthful, but we can make sense of it with a diagram.

{% include figure.html src="/img/dot_product.png" caption="Figure 4: Calculating Influence with Vectors" %}

*Note: the unit vector is not shown to scale in the diagram. It's actually the same length as a side of the unit square.*

In this diagram, the green line segment represents the influence at that grid point. It corresponds to the random influences we assigned to each grid point in Simple Gradient Noise.

The operation that I've shown in the digram where we draw a line perpendicular from the unit vector to the chosen point and then measure the distance from the unit point to where the perpendicular line touches the unit vector is called *calculating the dot product*.

It may look complicated in the diagram, but calculating the dot product is easy:

<div style="margin:10px;">
  <math>
    <msub>
      <mi>x</mi>
      <mn>1</mn>
    </msub>
    <mo>*</mo>
    <msub>
      <mi>x</mi>
      <mn>2</mn>
    </msub>
    <mo>+</mo>
    <msub>
      <mi>y</mi>
      <mn>1</mn>
    </msub>
    <mo>*</mo>
    <msub>
      <mi>y</mi>
      <mn>2</mn>
    </msub>
  </math>
</div>


The result of doing this at each corner is that we get a different set of influences at each point inside the unit square!

Other than that, Perlin Noise is pretty much the same as Simple Gradient Noise. With one little exception...


# The Ease Curve

An ease curve is a equation that tapers towards its maximum and minimum value.  We can use it to blend the pixels near the edges of the unit square together so the transition isn't so harsh. If we don't use an ease function, Perlin Noise looks really blocky.  The trick is to treat the pixels near the edge of the unit square as if they are a bit closer to the edge than they really are.  That way pixels near the edge will be more similar and "fade" together.

The equation that Dr. Perlin recommends is:

<div style="margin:10px;">
  <math>
    <mn>6</mn>
    <msup>
      <mi>t</mi>
      <mn>5</mn>
    </msup>
    <mo>-</mo>
    <mn>15</mn>
    <msup>
      <mi>t</mi>
      <mn>4</mn>
    </msup>
    <mo>+</mo>
    <mn>10</mn>
    <msup>
      <mi>t</mi>
      <mn>3</mn>
    </msup>
  </math>
</div>  

Here's a graph of the values of this equation as it goes from 0 to 1.

{% include figure.html src="/img/easing-curve.png" caption="Figure 3: Graph of the Ease Function" %}

Notice how it looks a lot like a x = y except near the ends where it flattens out. That's the easing part.

The quantity that we will modify with the *ease* function is the x and y offset within the unit square.

And here's how we accomplish it in code:

{%highlight javascript%}
function ease(t){
  return 6 * Math.pow(t,5) - 15 * Math.pow(t,4) + 10 * Math.pow(t,3);
}
{%endhighlight%}

Apply this to each dimension.

{%highlight javascript%}
dist_x = ease(dist_x);
dist_y = ease(dist_y);
{%endhighlight%}

#Putting it All Together

Here's the source code for generating Perlin Noise:

{%highlight javascript%}
$.fn.PerlinNoise = function(){

  var ctx= this[0].getContext("2d");
  var rnd = new Chance(42);

  /* we'll have a grid point spaced every ten pixels. That's 100 grid points
  for the whole picture. */

  //STEP 0: Setup

  var grid_point_spacing = 10;
  var pixel_size = 2;
  var gunit = grid_point_spacing * pixel_size;

  /* For Perlin Noise we use vectors, not scalars */

  //STEP 0.1: Make a List of the Special Vectors We Will Use

  var v = [
    {x:1,y:0},
    {x:0,y:1},
    {x:1,y:1},
    {x: -1,y:0},
    {x: 0,y: -1},
    {x: -1,y: -1}
  ];

  /* Grid point random vectors. Note, this will be a number between
      0 and 5 that we will use to look up one of our 6 vectors in the v array */

  var gprn = [];

  for(var i = 0; i < 120; i++){
    gprn[i] = Math.round(rnd.floating({min: 0, max: 5}));
  }

  function lerp(v0, v1, t) {
    return v0 + t*(v1-v0);
  }

  function hash_xy(x,y){
    var hx = x / gunit;
    var hy = y / gunit;
    var hash = hx + (hy * 10);
    return hash;
  }

  function ease(t){
    return 6 * Math.pow(t,5) - 15 * Math.pow(t,4) + 10 * Math.pow(t,3);
  }

  var X0, X1, Y0, Y1 = 0;

  var max_val = 0;
  var min_val = 0;

  for (var y = 0; y < 200; y = y + pixel_size){
    for (var x = 0; x < 200; x = x + pixel_size){

      //STEP 1: Calculate the Surrounding Grid Points

      //figure out what the surrounding grid points are
      var X0 = Math.floor(x / gunit) * gunit;
      var X1 = X0 + gunit;
      var Y0 = Math.floor(y / gunit) * gunit;
      var Y1 = Y0 + gunit;

      //STEP 2: Look up the random VECTOR

      //look up the random vector associated with each point
      var rnd0 = v[gprn[hash_xy(X0,Y0)]];
      var rnd1 = v[gprn[hash_xy(X1,Y0)]];
      var rnd2 = v[gprn[hash_xy(X1,Y1)]];
      var rnd3 = v[gprn[hash_xy(X0,Y1)]];

      /*STEP 2.1: Calculate the Distance From Each Grid Point to the
        point of interest */

      var dist0 = {x: (x - X0) / gunit, y: (y - Y0) / gunit};
      var dist1 = {x: (x - X1) / gunit, y: (y - Y0) / gunit};
      var dist2 = {x: (x - X1) / gunit, y: (y - Y1) / gunit};
      var dist3 = {x: (x - X0) / gunit, y: (y - Y1) / gunit};

      //STEP 2.2: Take the Dot Product

      var dprod0 = (rnd0.x * dist0.x) + (rnd0.y * dist0.y);
      var dprod1 = (rnd1.x * dist1.x) + (rnd1.y * dist1.y);
      var dprod2 = (rnd2.x * dist2.x) + (rnd2.y * dist2.y);
      var dprod3 = (rnd3.x * dist3.x) + (rnd3.y * dist3.y);


      //Step 3: Calculate Where the Point is in the Unit Square
      //find out how far into the unit square we are
      var dist_x = (x - X0) / gunit;
      var dist_y = (y - Y0) / gunit;

      //Step 3.1: Ease Each Dimension

      dist_x = ease(dist_x);
      dist_y = ease(dist_y);


      //Step 4: Use Linear Interpolation to Get an Average

      var lrp1 = lerp(dprod0,dprod1,dist_x);
      var lrp2 = lerp(dprod3,dprod2,dist_x);
      var color_scale = lerp(lrp1,lrp2,dist_y);

      //Step 5: Calculate the Blue Value of Calculated Weight

      var blue_val = Math.round(color_scale * 127);

      //shift the range up to 0 to 255
      blue_val = 127 + blue_val;


      if(blue_val > max_val){
          max_val = blue_val;
      }

      if(blue_val < min_val){
        min_val = blue_val;
      }


      ctx.fillStyle = "rgba(0,0," + blue_val + ",1)";
      ctx.fillRect(x,y, 2, 2);
    }
  }


  return this;
}
{%endhighlight%}


Here's what he output of the above function looks like.

<canvas id="perlinnoise" width="200" height="200" style="border: 1px solid black;"></canvas>

Much more natural!

Now let's go over each of the differences from Simple Gradient Noise.

# STEP 0.1: Make a List of the Special Vectors We Will Use

Recall that in Perlin Noise, we assign a random vector to each grid point. Well, we don't just assign ANY vectors.  We pick from among a small number of special vectors that are evenly destributed around each grid point.  I don't really understand why this makes Perlin Noise look better, but I can quote Ken Perlin's
"Improving Noise" paper:

> The second deficiency is that whereas the gradients in G are
> distributed uniformly over a sphere, the cubic grid itself has
> directional biases, being shortened along the axes and elongated
> on the diagonals between opposite cube vertices. This directional
> asymmetry tends to cause a sporadic clumping effect, where
> nearby gradients that are almost axis-aligned, and therefore close
> together, happen to align with each other, causing anomalously
> high values in those regions

*Shrug*. If you can break this down into plain English for me, then please comment!

Anyway, for 2D noise these are the recommended vectors:

* (1,0)
* (0,1)
* (1,1)
* (-1,0)
* (0,-1)
* (-1,-1)

# STEP 2.1: Calculate the Distance From Each Grid Point to the Point of Interest

Recall from the discussion of gradient vectors that we need to calculate the vectors from each grid point to our point of interest.

Here's the code:

{%highlight javascript%}
var dist0 = {x: (x - X0) / gunit, y: (y - Y0) / gunit};
var dist1 = {x: (x - X1) / gunit, y: (y - Y0) / gunit};
var dist2 = {x: (x - X1) / gunit, y: (y - Y1) / gunit};
var dist3 = {x: (x - X0) / gunit, y: (y - Y1) / gunit};
{%endhighlight%}

# STEP 2.2: Take the Dot Product

As described above, calculate the dot product of the random vector and the vector from the grid point to the chosen point.  Do this for all surrounding points.

{%highlight javascript%}
var dprod0 = (rnd0.x * dist0.x) + (rnd0.y * dist0.y);
var dprod1 = (rnd1.x * dist1.x) + (rnd1.y * dist1.y);
var dprod2 = (rnd2.x * dist2.x) + (rnd2.y * dist2.y);
var dprod3 = (rnd3.x * dist3.x) + (rnd3.y * dist3.y);
{%endhighlight%}

# Step 3.1: Ease Each Dimension

Apply the *ease* function to each dimension as described above.

{%highlight javascript%}
dist_x = ease(dist_x);
dist_y = ease(dist_y);
{%endhighlight%}

## Conclusion

Perlin Noise is great for generating textures for terrain, clouds, fire, and anything else that needs to look naturally messy.  I hope this post is useful to you in making your own projects with Perlin Noise.

## Resources

* [Ken Perlin's "Making Noise" Presentation][making-noise]
* [Matt Zucker's Perlin Noise FAQ][matt-zucker]
* [Hugo Elias' Explainer (Not really Perlin Noise but lots of good info)][hugo-elias]
* [FlaFla2's Soapbox][flafla2]
* [Ken Perlin's paper on improved noise.][improving-noise]


[no-mans-sky]: https://www.youtube.com/watch?v=h-kifCYToAU&spfreload=10
[ken-perlin]: http://en.wikipedia.org/wiki/Ken_Perlin
[making-noise]: http://www.noisemachine.com/talk1/
[matt-zucker]: http://webstaff.itn.liu.se/~stegu/TNM022-2005/perlinnoiselinks/perlin-noise-math-faq.html
[hugo-elias]: http://freespace.virgin.net/hugo.elias/models/m_perlin.htm
[flafla2]: http://flafla2.github.io/2014/08/09/perlinnoise.html
[chancejs]: http://chancejs.com
[khan-academy]: http://www.khanacademy.org/math/linear-algebra
[improving-noise]: http://mrl.nyu.edu/~perlin/paper445.pdf

<script src='https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML'></script>
<script src="https://code.jquery.com/jquery-1.11.2.min.js"></script>
<script src="/js/chance.min.js"></script>
<script src="/js/perlin_noise.js"></script>

<script type="text/javascript"
      src="https://www.google.com/jsapi?autoload={
        'modules':[{
          'name':'visualization',
          'version':'1',
          'packages':['corechart']
        }]
      }"></script>



<script language="javascript">

MathJax.Hub.Config({
  "HTML-CSS": {
    preferredFont: "STIX"
  }
});

  $("#noncoherentnoise").NonCoherentNoise();

  //Non-Coherent Noise Chart
  function RenderNCNChart(){

      var rnd = new Chance(42);
      var data = new google.visualization.DataTable();
      data.addColumn('number', 'Pixels');
      data.addColumn('number', 'Color');
      for(var i = 0; i < 100; i++){
        data.addRow([i,rnd.integer({min: 0, max: 6})]);
      }

      var options = {
        title: 'Color vs. Pixel Number (Non-Coherent Noise)',
        hAxis: {
          title: 'Pixel Number'
        },
        vAxis: {
          title: 'Color'
        }
      }

      var chart = new google.visualization.LineChart(document.getElementById('noncoherentnoisechart'));

      chart.draw(data, options);
  }

  RenderNCNChart();


  $("#sinecontour").SineContour();


  //SineContour  Chart
  function RenderSineContourChart(){

      var data = new google.visualization.DataTable();
      var blue_val = 0;
      data.addColumn('number', 'Pixels');
      data.addColumn('number', 'Color');
      for(var i = 0; i < 100; i++){
        x_sin = Math.sin(i / 5);
        blue_val = Math.abs(Math.floor(195 + (x_sin * 60)));
        data.addRow([i,blue_val]);
      }

      var options = {
        title: 'Color vs. Pixel Number (Sine Contour)',
        hAxis: {
          title: 'Pixel Number'
        },
        vAxis: {
          title: 'Amount of Blue'
        }
      }

      var chart = new google.visualization.LineChart(document.getElementById('sinecontourchart'));

      chart.draw(data, options);
  }

  RenderSineContourChart();



  $("#simplegradientnoise").SimpleGradientNoise(false);
  $("#perlinnoise").PerlinNoise();

</script>
