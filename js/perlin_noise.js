(function ($) {

    $.fn.NonCoherentNoise = function(){

      var Colors = ["red","green","blue","yellow","white","orange","black"];
      var ctx=this[0].getContext("2d");
      var rnd = new Chance(42);

      for (var y = 0; y < 200; y = y + 2){
        for (var x = 0; x < 200; x = x + 2){
          ctx.fillStyle = Colors[rnd.integer({min: 0, max: 6})];
          ctx.fillRect(x,y, 2, 2);
        }
      }
      return this;
    }

    $.fn.SineContour = function (){

      var ctx=this[0].getContext("2d");

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
      return this;
    }

    $.fn.SimpleGradientNoise = function(apply_easing){


      var ctx= this[0].getContext("2d");
      var rnd = new Chance(42);

      /* we'll have a grid point spaced every ten pixels. That's 100 grid points
      for the whole picture. */

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

      function ease(t){
        return 6 * Math.pow(t,5) - 15 * Math.pow(t,4) + 10 * Math.pow(t,3);
      }

      var X0, X1, Y0, Y1 = 0;


      for (var y = 0; y < 200; y = y + pixel_size){
        for (var x = 0; x < 200; x = x + pixel_size){

          //figure out what the surrounding grid points are
          var X0 = Math.floor(x / gunit) * gunit;
          var X1 = X0 + gunit;
          var Y0 = Math.floor(y / gunit) * gunit;
          var Y1 = Y0 + gunit;

          //look up the random number associated with each point
          var rnd0 = gprn[hash_xy(X0,Y0)];
          var rnd1 = gprn[hash_xy(X1,Y0)];
          var rnd2 = gprn[hash_xy(X1,Y1)];
          var rnd3 = gprn[hash_xy(X0,Y1)];

          //find out how far into the unit square we are
          var dist_x = (x - X0) / gunit;
          var dist_y = (y - Y0) / gunit;

          if(apply_easing){
            dist_x = ease(dist_x);
            dist_y = ease(dist_y);
          }

          //interpolate the value for each side
          var lrp1 = lerp(rnd0,rnd1,dist_x);
          var lrp2 = lerp(rnd3,rnd2,dist_x);
          var color_scale = lerp(lrp1,lrp2,dist_y);


          var blue_val = Math.round(color_scale * 255);


          ctx.fillStyle = "rgba(0,0," + blue_val + ",1)";
          ctx.fillRect(x,y, 2, 2);
        }
      }
      return this;
    }

    $.fn.PerlinNoise = function(){

      var ctx= this[0].getContext("2d");
      var rnd = new Chance(42);

      /* we'll have a grid point spaced every ten pixels. That's 100 grid points
      for the whole picture. */

      var grid_point_spacing = 10;
      var pixel_size = 2;
      var gunit = grid_point_spacing * pixel_size;

      var v = [
        {x:1,y:0},
        {x:0,y:1},
        {x:1,y:1},
        {x: -1,y:0},
        {x: 0,y: -1},
        {x: -1,y: -1}
      ];

      //grid point random vectors
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

          //figure out what the surrounding grid points are
          var X0 = Math.floor(x / gunit) * gunit;
          var X1 = X0 + gunit;
          var Y0 = Math.floor(y / gunit) * gunit;
          var Y1 = Y0 + gunit;

          //look up the random vector associated with each point
          var rnd0 = v[gprn[hash_xy(X0,Y0)]];
          var rnd1 = v[gprn[hash_xy(X1,Y0)]];
          var rnd2 = v[gprn[hash_xy(X1,Y1)]];
          var rnd3 = v[gprn[hash_xy(X0,Y1)]];

          var dist0 = {x: (x - X0) / gunit, y: (y - Y0) / gunit};
          var dist1 = {x: (x - X1) / gunit, y: (y - Y0) / gunit};
          var dist2 = {x: (x - X1) / gunit, y: (y - Y1) / gunit};
          var dist3 = {x: (x - X0) / gunit, y: (y - Y1) / gunit};

          var dprod0 = (rnd0.x * dist0.x) + (rnd0.y * dist0.y);
          var dprod1 = (rnd1.x * dist1.x) + (rnd1.y * dist1.y);
          var dprod2 = (rnd2.x * dist2.x) + (rnd2.y * dist2.y);
          var dprod3 = (rnd3.x * dist3.x) + (rnd3.y * dist3.y);


          //find out how far into the unit square we are
          var dist_x = (x - X0) / gunit;
          var dist_y = (y - Y0) / gunit;

          //ease each dimension
          dist_x = ease(dist_x);
          dist_y = ease(dist_y);

          //interpolate the value for each side

          var lrp1 = lerp(dprod0,dprod1,dist_x);
          var lrp2 = lerp(dprod3,dprod2,dist_x);
          var color_scale = lerp(lrp1,lrp2,dist_y);

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

}( jQuery ));
