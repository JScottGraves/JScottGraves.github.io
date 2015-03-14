---
layout: post
title:  "Perlin Noise"
date:   2015-03-11 17:10:00
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

To do that, we'll use a trick that we'll see again when we talk about Perlin Noise.  Instead of picking a random value for each and every point, we'll pick a few random values evenly spaced throughout the picture.  Let's call this arrangement of points a *grid* and each point a *grid point*.




##Perlin Noise

Perlin Noise is a kind of coherent noise. So it's *smooth* (coherent) like our sine contours but also noise (random) like our non-coherent clown vomit.


# The Ease Curve

![Ease Curve](/img/easing-curve.png)

# Resources

* [Ken Perlin's "Making Noise" Presentation][making-noise]
* [Matt Zucker's Perlin Noise FAQ][matt-zucker]
* [Hugo Elias' Explainer (Not really Perlin Noise but lots of good info)][hugo-elias]
* [FlaFla2's Soapbox][flafla2]



[no-mans-sky]: https://www.youtube.com/watch?v=h-kifCYToAU&spfreload=10
[ken-perlin]: http://en.wikipedia.org/wiki/Ken_Perlin
[making-noise]: http://www.noisemachine.com/talk1/
[matt-zucker]: http://webstaff.itn.liu.se/~stegu/TNM022-2005/perlinnoiselinks/perlin-noise-math-faq.html
[hugo-elias]: http://freespace.virgin.net/hugo.elias/models/m_perlin.htm
[flafla2]: http://flafla2.github.io/2014/08/09/perlinnoise.html
[chancejs]: http://chancejs.com
[khan-academy]: http://www.khanacademy.org/math/linear-algebra

<script src="/js/chance.js"></script>
<script type="text/javascript"
      src="https://www.google.com/jsapi?autoload={
        'modules':[{
          'name':'visualization',
          'version':'1',
          'packages':['corechart']
        }]
      }"></script>

<script language="javascript">

  //Non-Coherent Noise Example

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

  NonCoherentNoise();

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

  }

  SineContour();


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


</script>
