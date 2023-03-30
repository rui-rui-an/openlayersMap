<template>
  <div class="home">
    <div class="btns">
      <el-button @click="addPoint">添加点</el-button>
      <el-button @click="addPoint">添加线</el-button>
      <el-button @click="addArea">添加面</el-button>
      <el-button @click="addPoint">定位到某个点</el-button>
      <el-button @click="addPoint">点击进行绘制</el-button>
      <el-button @click="addPicPoint">添加图片标注</el-button>
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
import * as ol from "openlayers"
export default {
  data() {
    return {
      map: null,
      vectorSource:null
    }
  },
  mounted() {
    this.initMap()
    console.log(this.addVectorLabel)
    this.map.on("click", (evt) => {
      console.log(evt)
      console.log(evt.coordinate)
      //鼠标单击点坐标
      var point = evt.coordinate
      //添加一个新的标注（矢量要素）
      this.addVectorLabel(point,this.vectorSource)
    })
  },
  methods: {
    initMap() {
      var projection = ol.proj.get("EPSG:3857")
      //分辨率
      var resolutions = []
      for (var i = 0; i < 19; i++) {
        resolutions[i] = Math.pow(2, 18 - i)
      }
      var tilegrid = new ol.tilegrid.TileGrid({
        origin: [0, 0],
        resolutions: resolutions,
      })
      //拼接百度地图出图地址
      var baidu_source = new ol.source.TileImage({
        //设置坐标参考系
        projection: projection,
        //设置分辨率
        tileGrid: tilegrid,
        //出图基地址
        tileUrlFunction: function (tileCoord, pixelRatio, proj) {
          if (!tileCoord) {
            return ""
          }
          var z = tileCoord[0]
          var x = tileCoord[1]
          var y = tileCoord[2]

          if (x < 0) {
            x = "M" + -x
          }
          if (y < 0) {
            y = "M" + -y
          }
          return (
            "http://online3.map.bdimg.com/onlinelabel/?qt=tile&x=" +
            x +
            "&y=" +
            y +
            "&z=" +
            z +
            "&styles=pl&udt=20151021&scaler=1&p=1"
          )
        },
      })
      //百度地图
      var baidu_layer = new ol.layer.Tile({
        source: baidu_source,
      })
      //地图容器
      this.map = new ol.Map({
        target: "map",
        layers: [baidu_layer],
        view: new ol.View({
          center: ol.proj.transform(
            [116.403, 39.924],
            "EPSG:4326",
            "EPSG:3857"
          ),
          zoom: 12,
        }),
      })
    },
    addPoint() {
      // console.log(ol.proj.transform([116.403, 39.924], "EPSG:4326", "EPSG:3857"))
      //创建一个点
      var point = new ol.Feature({
        geometry: new ol.geom.Point(
          ol.proj.transform([116.403, 39.924], "EPSG:4326", "EPSG:3857")
        ),
      })
      //设置点1的样式信息
      point.setStyle(
        new ol.style.Style({
          //填充色
          fill: new ol.style.Fill({
            color: "rgba(255, 255, 255, 0.2)",
          }),
          //边线颜色
          stroke: new ol.style.Stroke({
            color: "#ffcc33",
            width: 2,
          }),
          //形状
          image: new ol.style.Circle({
            radius: 17,
            fill: new ol.style.Fill({
              color: "#ffcc33",
            }),
          }),
        })
      )

      //实例化一个矢量图层Vector作为绘制层
      var source = new ol.source.Vector({
        features: [point],
      })
      console.log(source)
      //创建一个图层
      var vector = new ol.layer.Vector({
        source: source,
      })
      //将绘制层添加到地图容器中
      this.map.addLayer(vector)
    },
    addArea() {
      //根据范围获取多边形
      var Rectangle = new ol.Feature({
        geometry: new ol.geom.Polygon.fromExtent([
          8208725.0, 2035304.0, 12841418.0, 4068487.0,
        ]),
      })

      Rectangle.setStyle(
        new ol.style.Style({
          fill: new ol.style.Fill({
            color: "rgba(33,33,33,0.5)",
          }),
          stroke: new ol.style.Stroke({
            color: "#ffcc33",
            width: 4,
          }),
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
              color: "#ffcc33",
            }),
          }),
        })
      )

      //实例化一个矢量图层Vector作为绘制层
      var source = new ol.source.Vector({
        features: [Rectangle],
      })
      //创建一个图层
      var vector = new ol.layer.Vector({
        source: source,
      })
      //将绘制层添加到地图容器中
      this.map.addLayer(vector)
    },
    addPicPoint() {
      // /**
      //  * 创建矢量标注样式函数,设置image为图标ol.style.Icon
      //  * @param {ol.Feature} feature 要素
      //  */
      let beijing = ol.proj.transform(
        [116.403, 39.924],
        "EPSG:4326",
        "EPSG:3857"
      )
      console.log(beijing)
      //实例化Vector要素，通过矢量图层添加到地图容器中
      var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(beijing),
      })
      console.log(this.createLabelStyle(iconFeature))
      iconFeature.setStyle(this.createLabelStyle(iconFeature))
      //矢量标注的数据源
      this.vectorSource = new ol.source.Vector({
        features: [iconFeature],
      })
      //矢量标注图层
      var vectorLayer = new ol.layer.Vector({
        source: this.vectorSource,
      })
      console.log(vectorLayer)
      this.map.addLayer(vectorLayer)

      // 实例化overlay标注，添加到地图容器中
      //为地图容器添加单击事件监听
      // function Addmarker() {
      //   this.map.on("click", function (evt) {
      //     //鼠标单击点坐标
      //     var point = evt.coordinate
      //     //添加一个新的标注（矢量要素）
      //     addVectorLabel(point)
      //   })
      // }
      this.addVectorLabel(
        ol.proj.transform([116.603, 39.524], "EPSG:4326", "EPSG:3857"),
        this.vectorSource
      )
    },
    createLabelStyle(feature) {
      return new ol.style.Style({
        /**{olx.style.IconOptions}类型*/
        image: new ol.style.Icon({
          anchor: [0.5, 60],
          anchorOrigin: "top-right",
          anchorXUnits: "fraction",
          anchorYUnits: "pixels",
          offsetOrigin: "top-right",
          // offset:[0,10],
          //图标缩放比例
          // scale:0.5,
          //透明度
          opacity: 0.95,
          //图标的url
          src: "../assets/logo.png",
        }),
      })
    },
    addVectorLabel(coordinate, vectorSource) {
      // /**
      //  * 添加一个新的标注（矢量要素）
      //  * @param {ol.Coordinate} coordinate 坐标点
      //  */
      //新建一个要素 ol.Feature
      var newFeature = new ol.Feature({
        //几何信息
        geometry: new ol.geom.Point(coordinate),
      })
      //设置要素的样式
      newFeature.setStyle(this.createLabelStyle(newFeature))
      //将新要素添加到数据源中
      vectorSource.addFeature(newFeature)
    },
  },
}
</script>

<style lang="less" scoped>
.home {
  .btns {
    width: 100%;
    height: 100px;
    // display: flex;
    // justify-content: center;
    // align-items: center;

    button {
      margin: 20px;
    }
  }

  #map {
    height: calc(100vh - 100px);
  }
}
</style>
