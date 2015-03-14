---
layout: post
title:  "Pinestein Day"
date:   2015-03-14 17:10:00
categories: math
---

On 3/14 nerds everywhere celebrate the Kanye West of transcendental numbers, Pi.  3/14 is also Einstein's birthday, the Jay Z of physics. So to celebrate both I'm going to do Pi / special relativity mash up.

##Pi, fast and slow

Pi is the ratio of the circumference of a circle to its diameter. Anybody who ever measured a circular object found it it was three times and change around as it is wide. But, then along came Einstein who reasoned that if you measure the speed of light to be the same no matter how fast you go or in what direction you travel, then there must be something wrong with our concept of measuring.  He was the first person to understand that what measurements you take from an object depends on the speed and direction its traveling in relationship to you.


If Einstein measured a circular coin in his hand he would find that the ratio of the diameter of the coin to its circumference is about Pi.  But if Chuck Norris hurled that same coin, edge on, past Einstein's head at a good percentage of the speed of light, his ratio would come out differently.  The coin wouldn't look perfectly round either, but more like an egg.

##Lorentz Contraction

How different Einstein's measurement of the coin's diameter would be is given by the following function:

{%highlight javascript%}
function LoretzContraction(LengthAtRest,RelativeVelocity){
  function LoretzContraction(LengthAtRest,RelativeVelocity){
    //in meters per second
    var c = 299792458;
    var lc = LengthAtRest * Math.sqrt(1 - (Math.pow(RelativeVelocity,2) / Math.pow(c,2)));
    return lc;
  }
{%endhighlight%}

But, this change in diameter would only affect the direction in which the coin was traveling.  His measurement of the height of the coin would stay the same. That would make the coin look squashed along the direction it moving past Einstein.

Here's what the coin would look like in Einsteins hand vs. whizzing past his head at half the speed of light.

<canvas id="coins" width="700" height="250" style="border: 1px black solid;"></canvas>

The traveling coin would be a different color too, but that doesn't matter for our calculations.

##A Plethora of Pis

As a perfect circle travels faster and faster past us, we get a different ratio for it's diameter and perimeter.  Maybe we can think about these as relativistic Pis?

Here's a graph of how these "pis" change as they go faster.

<div id="pichart" style="width: 700px; height: 400px; border: 1px black solid; border-bottom:10px;"></div>

So, there you go! All the Pis you could ever want.

<script type="text/javascript"
      src="https://www.google.com/jsapi?autoload={
        'modules':[{
          'name':'visualization',
          'version':'1',
          'packages':['corechart']
        }]
      }"></script>

<script language="javascript">

var gc = 299792458;

function LoretzContraction(LengthAtRest,RelativeVelocity){
  //in meters per second
  var c = 299792458;
  var lc = LengthAtRest * Math.sqrt(1 - (Math.pow(RelativeVelocity,2) / Math.pow(c,2)));
  return lc;
}


function drawEllipse(centerX, centerY, width,context,fstyle) {

  UnitDiameter = 200;
  var start = 0;
  var end = 2 * Math.PI; // 360 degrees is equal to 2π radians

  context.save();
  context.scale(width,1);
  context.beginPath();
  context.arc(centerX, centerY, UnitDiameter / 2, start, end);
  context.fillStyle = fstyle;
  context.fill();
  context.closePath();
  context.restore();
}


function Perimeter(Diameter){
  var b = Diameter / 2;
  return 2*Math.PI*Math.sqrt((0.5*0.5+b*b)/2)
}

function DrawCoins(){

  CoinColor = "#BF984E";
  CenterAtRest = 200;
  CenterInMotion = 550;

  var c=document.getElementById("coins");
  var ctx=c.getContext("2d");

  drawEllipse(CenterAtRest, 120, 1,ctx,CoinColor);
  drawEllipse(CenterInMotion, 120, LoretzContraction(1,gc / 2),ctx,CoinColor);


}

//SineContour  Chart
function RenderRPiChart(){

    var data = new google.visualization.DataTable();
    var blue_val = 0;
    var r = 0;
    var v = 0;
    data.addColumn('string', 'PercentSpeed');
    data.addColumn('number', '"Pi"');
    for(var i = 0; i < 90; i++){
      r = i / 100;
      v = gc * r;
      data.addRow([i + "%",Perimeter(LoretzContraction(1,v))]);
    }

    var options = {
      title: 'Percentage Speed of Light vs. "Pi"',
      hAxis: {
        title: 'Speed of Light %'
      },
      vAxis: {
        title: '"Pi"'
      }
    }

    var chart = new google.visualization.LineChart(document.getElementById('pichart'));

    chart.draw(data, options);
}

DrawCoins();
RenderRPiChart();


</script>
