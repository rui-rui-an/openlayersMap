<template>
  <div class="home">
    <div class="btns">
      <el-button @click="addPoint">添加点</el-button>
      <el-button @click="addLine">添加线</el-button>
      <el-button @click="addPoint">添加面</el-button>
      <el-button @click="addPoint">定位到某个点</el-button>
      <el-button @click="addPoint">点击进行绘制</el-button>
      <el-button @click="addPoint">添加图片标注</el-button>
      <el-button @click="addPoint">添加popup</el-button>
      <el-button @click="addPoint">轨迹回放</el-button>
      <el-button @click="addPoint">点慢慢增加</el-button>
      <el-button @click="addPoint">更换为天地图</el-button>
      <el-button @click="addPoint">更换为百度地图</el-button>
      <el-button @click="addPoint">更换为高德地图</el-button>
    </div>
    <div class="map" id="map"></div>
  </div>
</template>

<script>
import * as ol from 'openlayers'
export default {
  data () {
    return {
      map: null
    }
  },
  mounted () {
    this.initMap()
  },
  methods: {
    initMap () {
      var projection = ol.proj.get("EPSG:3857");
      //分辨率
      var resolutions = [];
      for (var i = 0; i < 19; i++) {
        resolutions[i] = Math.pow(2, 18 - i);
      }
      var tilegrid = new ol.tilegrid.TileGrid({
        origin: [0, 0],
        resolutions: resolutions
      });
      //拼接百度地图出图地址
      var baidu_source = new ol.source.TileImage({
        //设置坐标参考系
        projection: projection,
        //设置分辨率
        tileGrid: tilegrid,
        //出图基地址
        tileUrlFunction: function (tileCoord, pixelRatio, proj) {
          if (!tileCoord) {
            return "";
          }
          var z = tileCoord[0];
          var x = tileCoord[1];
          var y = tileCoord[2];

          if (x < 0) {
            x = "M" + (-x);
          }
          if (y < 0) {
            y = "M" + (-y);
          }
          return "http://online3.map.bdimg.com/onlinelabel/?qt=tile&x=" + x + "&y=" + y + "&z=" + z + "&styles=pl&udt=20151021&scaler=1&p=1";
        }
      });
      //百度地图
      var baidu_layer = new ol.layer.Tile({
        source: baidu_source
      });
      //地图容器
      this.map = new ol.Map({
        target: 'map',
        layers: [baidu_layer],
        view: new ol.View({
          center: ol.proj.transform([116.403, 39.924], 'EPSG:4326', 'EPSG:3857'),
          zoom: 12
        })
      })
    },
    addPoint () {
      //创建一个点
      var point = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.transform([116.403, 39.924], 'EPSG:4326', 'EPSG:3857'))
      });
      //设置点1的样式信息
      point.setStyle(new ol.style.Style({
        //填充色
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        }),
        //边线颜色
        stroke: new ol.style.Stroke({
          color: '#ffcc33',
          width: 2
        }),
        //形状
        image: new ol.style.Circle({
          radius: 17,
          fill: new ol.style.Fill({
            color: '#ffcc33'
          })
        })
      }));

      //实例化一个矢量图层Vector作为绘制层
      var source = new ol.source.Vector({
        features: [point]
      });
      console.log(source);
      //创建一个图层
      var vector = new ol.layer.Vector({
        source: source
      });
      //将绘制层添加到地图容器中
      this.map.addLayer(vector);
    },
    addLine(){
      //创建一个线
      var Line = new ol.Feature({
            geometry: new ol.geom.LineString([[8208725.0, 3835304.0], [16055444.0, 4578883.0]])
        });

        //设置线的样式
        Line.setStyle(new ol.style.Style({
            //填充色
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            //边线颜色
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 5
            }),
            //形状
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ffcc33'
                })
            })
        }));

        //实例化一个矢量图层Vector作为绘制层
        var source = new ol.source.Vector({
            features: [Line]
        });
        //创建一个图层
        var vector = new ol.layer.Vector({
            source: source
        });
        //将绘制层添加到地图容器中
        this.map.addLayer(vector);
    }
  }
}
</script>

<style lang="less" scoped>
.home {
  .btns {
    width: 100%;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;

    button {
      margin: 20px;
    }
  }

  #map {
    height: calc(100vh - 100px);
  }
}
</style>