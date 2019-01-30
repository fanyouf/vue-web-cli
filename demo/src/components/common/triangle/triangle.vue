<template lang="html">
  <div class="">
    <canvas id="canvas" width="400" height="300"></canvas>
  </div>
</template>

<script>
export default {
  props:{
    percentList:{
      type: Array,
      default: function(){
        return [60,80,100]
      }
    }
  },
  data(){
    return {
      percents : this.percentList
    }
  },
  methods:{
    _drawLeft(){
      let heights = this.percents.map( item => item* Math.sqrt(3)/2 * this.lineWidth/100)
      let rightPionts = [{x:this.diff+this.lineWidth/2, y:this.diff}];
      let leftPionts  = [{x:this.diff+this.lineWidth/2, y:this.diff}];

      heights.forEach((item,index) => {
        let ps1 = {
          x: (this.diff + this.lineWidth/2) + heights[index] / Math.sqrt(3),
          y: this.diff + heights[index]
        }
        rightPionts.push(ps1)

        let ps2 = {
          x: (this.diff + this.lineWidth/2) - heights[index] / Math.sqrt(3),
          y: this.diff + heights[index]
        }
        leftPionts.push(ps2)
      })

      for(var i = 0; i < rightPionts.length-1; i++ ){
        this.ctx.beginPath();
        this.ctx.moveTo(rightPionts[i].x,rightPionts[i].y);
        this.ctx.lineTo(rightPionts[i+1].x,rightPionts[i+1].y);
        this.ctx.lineTo(leftPionts[i+1].x,leftPionts[i+1].y);
        this.ctx.lineTo(leftPionts[i].x,leftPionts[i].y);

        this.ctx.closePath();
        this.ctx.stroke();
      }

    },
    _drawRight(){
      let heights = this.percents.map( item => item* Math.sqrt(3)/2 * this.lineWidth/100)

      let rightPionts = [{x:3*this.diff+1.5*this.lineWidth, y:this.diff+ Math.sqrt(3)/2* this.lineWidth}];
      let leftPionts  = [{x:3*this.diff+1.5*this.lineWidth, y:this.diff+ Math.sqrt(3)/2* this.lineWidth}];

      heights.forEach((item,index) => {
        let ps1 = {
          x: 3*this.diff+1.5*this.lineWidth + heights[index] / Math.sqrt(3),
          y: this.diff+ Math.sqrt(3)/2* this.lineWidth -  heights[index]
        }
        rightPionts.push(ps1)

        let ps2 = {
          x: 3*this.diff+1.5*this.lineWidth - heights[index] / Math.sqrt(3),
          y: this.diff+ Math.sqrt(3)/2* this.lineWidth -  heights[index]
        }
        leftPionts.push(ps2)
      })

      for(var i = 0; i < rightPionts.length-1; i++ ){
        this.ctx.beginPath();
        this.ctx.moveTo(rightPionts[i].x,rightPionts[i].y);
        this.ctx.lineTo(rightPionts[i+1].x,rightPionts[i+1].y);
        this.ctx.lineTo(leftPionts[i+1].x,leftPionts[i+1].y);
        this.ctx.lineTo(leftPionts[i].x,leftPionts[i].y);

        this.ctx.closePath();
        this.ctx.stroke();
      }

    }
  },
  mounted(){
    var canvas = document.getElementById('canvas');
    this.ctx = canvas.getContext('2d');
    this.width = 400;
    this.height = 300;
    this.diff = 20;
    this.oriX = this.diff;
    this.oriY = this.diff;
    this.lineWidth = (this.width -4* this.diff)/2

    this._drawLeft()
    this._drawRight()

  }

}
</script>

<style lang="css">
</style>
