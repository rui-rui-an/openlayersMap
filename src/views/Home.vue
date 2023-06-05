<template>
  <div class="home">
    <div class="btns">
      <el-button @click="addPoint">添加点</el-button>
      <el-button @click="addLine">添加线</el-button>
      <el-button @click="addArea">添加面</el-button>
      <el-button @click="toPoint">定位到某个点</el-button>
      <div>选择进行绘制</div>
      <el-select v-model="selectValue" @change="selectChange">
        <el-option
          v-for="item in selectList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>

      <el-button @click="addPic">添加图片标注</el-button>
      <el-button @click="addText">添加文字标注</el-button>
      <el-button @click="addPicAndText">添加图文标注</el-button>
      <el-button @click="addPopup">添加popup</el-button>
      <el-button @click="addPointAndView">轨迹回放</el-button>
      <el-button @click="addManyPoints">点聚合地图</el-button>
      <el-button @click="addPoint">更换为天地图</el-button>
      <el-button @click="addPoint">更换为百度地图</el-button>
      <el-button @click="addPoint">更换为高德地图</el-button>
    </div>
    <div ref="popup_content" class="popup_content" v-show="popupContentShow">
      <div class="fater">
        <div class="son">这里是注解文字</div>
      </div>
    </div>
    <div class="map" id="map"></div>
  </div>
</template>

<script>
const selectList = [
  {
    label: "清空绘制图形",
    value: "None",
  },
  {
    label: "点",
    value: "Point",
  },
  {
    label: "线",
    value: "LineString",
  },
  {
    label: "多边形",
    value: "Polygon",
  },
  {
    label: "圆",
    value: "Circle",
  },
  {
    label: "正方形",
    value: "Square",
  },
  {
    label: "长方形",
    value: "Box",
  },
]
import * as ol from "openlayers"
export default {
  data() {
    return {
      map: null,
      selectList: selectList,
      selectValue: "None",
      draw: "",
      source: "",
      vector: "",
      popupContentShow: false,
    }
  },
  mounted() {
    // 生成地图
    this.initMap()
    // 生成一个绘制层，用于地图绘制
    this.initDraw()
  },
  methods: {
    clearMap(){
      // const layers = this.map.getLayers()
      // this.map.removeLayer(layers)
      // console.log(layers);
    },
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
    moveToPosition(postion,zoom = 14) {
      this.map.getView().animate({
        //将地理坐标转为投影坐标
        center: ol.proj.transform(postion, "EPSG:4326", "EPSG:3857"),
        duration: 500,
        zoom: zoom,
      })
    },
    addPoint() {
      this.clearMap()
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

      this.moveToPosition([116.403, 39.924])
      // const allLayers = this.map.getAllLayers()
      // console.log(allLayers);
    },
    addLine() {
      //创建一个线
      var Line = new ol.Feature({
        geometry: new ol.geom.LineString([
          ol.proj.transform([116.403, 39.924], "EPSG:4326", "EPSG:3857"),
          ol.proj.transform([116.503, 39.994], "EPSG:4326", "EPSG:3857"),
        ]),
      })

      //设置线的样式
      Line.setStyle(
        new ol.style.Style({
          //填充色
          fill: new ol.style.Fill({
            color: "rgba(255, 255, 255, 0.2)",
          }),
          //边线颜色
          stroke: new ol.style.Stroke({
            color: "#ffcc33",
            width: 5,
          }),
          //形状
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
        features: [Line],
      })
      //创建一个图层
      var vector = new ol.layer.Vector({
        source: source,
      })
      //将绘制层添加到地图容器中
      this.map.addLayer(vector)
      this.moveToPosition([116.503, 39.994])
    },
    toPoint() {
      //这里给动画设置一个初始值
      this.map.getView().animate({
        //将地理坐标转为投影坐标
        center: ol.proj.transform([117.403, 42.924], "EPSG:4326", "EPSG:3857"),
        duration: 1000,
        zoom: 12,
      })
    },
    // toDraw () {
    //   // 添加绘制工具
    //   this.addInteraction()
    // },
    initDraw() {
      //实例化一个矢量图层Vector作为绘制层
      this.source = new ol.source.Vector({ wrapX: false })
      this.vector = new ol.layer.Vector({
        source: this.source,
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: "rgba(255, 255, 255, 0.2)",
          }),
          stroke: new ol.style.Stroke({
            color: "#ffcc33",
            width: 10,
          }),
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
              color: "#ffcc33",
            }),
          }),
        }),
      })
      //将绘制层添加到地图容器中
      this.map.addLayer(this.vector)
    },

    //根据绘制类型进行交互绘制图形处理
    addInteraction() {
      let type
      //绘制对象
      if (this.selectValue !== "None") {
        type = this.selectValue
        if (this.source == null) {
          this.source = new ol.source.Vector({ wrapX: false })
          //添加绘制层数据源
          this.vector.setSource(this.source)
        }
        var geometryFunction, maxPoints
        if (this.selectValue === "Square") {
          type = "Circle"
          //正方形图形（圆）
          geometryFunction = ol.interaction.Draw.createRegularPolygon(4)
        } else if (this.selectValue === "Box") {
          type = "LineString"
          maxPoints = 2
          geometryFunction = function (coordinates, geometry) {
            if (!geometry) {
              //多边形
              geometry = new ol.geom.Polygon(null)
            }
            var start = coordinates[0]
            var end = coordinates[1]
            geometry.setCoordinates([
              [start, [start[0], end[1]], end, [end[0], start[1]], start],
            ])
            return geometry
          }
        }
        //实例化交互绘制类对象并添加到地图容器中
        this.draw = new ol.interaction.Draw({
          //绘制层数据源
          source: this.source,
          /** @type {ol.geom.GeometryType}几何图形类型 */
          type: type,
          //几何信息变更时调用函数
          geometryFunction: geometryFunction,
          //最大点数
          maxPoints: maxPoints,
        })
        this.map.addInteraction(this.draw)
      } else {
        // console.log(111)
        this.source = null
        //清空绘制图形
        this.vector.setSource(this.source)
      }
    },
    selectChange() {
      //移除绘制图形
      this.map.removeInteraction(this.draw)
      //添加交互绘制功能控件
      this.addInteraction()
    },
    addArea() {
      //根据范围获取多边形
      var Rectangle = new ol.Feature({
        geometry: new ol.geom.Polygon.fromExtent([
          16208725.0, 3035304.0, 9841418.0, 5068487.0,
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

      this.moveToPosition([116.403, 39.924],4)
    },
    addPointAndView() {
      var Coordinates = new Array();
        for (var i = 0; i < 600000; i += 5000) {
            Coordinates.push([(-30322402) + i, 5444359 - i]);
        }
        for (var j = 0; j < 600000; j += 5000) {
            Coordinates.push([(-30322402) + 600000 + j, 5444359 - 600000]);
        }
        for (var k = 0; k < 600000; k += 5000) {
            Coordinates.push([(-30322402) + 1200000 + k, 5444359 - 600000 - k]);
        }
        for (var h = 0; h < 600000; h += 5000) {
            Coordinates.push([(-30322402) + 1800000 + h, 5444359 - 1200000]);

        }
        //将离散点构建成一条折线
        var route = new ol.geom.LineString(Coordinates);
        //获取直线的坐标
        var routeCoords = route.getCoordinates();
        var routeLength = routeCoords.length;

        var routeFeature = new ol.Feature({
            type: 'route',
            geometry: route
        });
        var geoMarker = new ol.Feature({
            type: 'geoMarker',
            geometry: new ol.geom.Point(routeCoords[0])
        });
        var startMarker = new ol.Feature({
            type: 'icon',
            geometry: new ol.geom.Point(routeCoords[0])
        });
        var endMarker = new ol.Feature({
            type: 'icon',
            geometry: new ol.geom.Point(routeCoords[routeLength - 1])
        });

        var styles = {
            'route': new ol.style.Style({
                stroke: new ol.style.Stroke({
                    width: 6,
                    color: [237, 212, 0, 0.8]
                })
            }),
            'icon': new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 1],
                    src: "../../images/stationicon.png"
                })
            }),
            'geoMarker': new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 7,
                    snapToPixel: false,
                    fill: new ol.style.Fill({ color: 'black' }),
                    stroke: new ol.style.Stroke({
                        color: 'white',
                        width: 2
                    })
                })
            })
        };

        var animating = false;
        var speed, now;
        var speedInput = document.getElementById('speed');
        var startButton = document.getElementById('start-animation');

        var vectorLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [routeFeature, geoMarker, startMarker, endMarker]
            }),
            style: function (feature) {
                //如果动画是激活的就隐藏geoMarker
                if (animating && feature.get('type') === 'geoMarker') {
                    return null;
                }
                return styles[feature.get('type')];
            }
        });
    },
    addPopup() {
      this.addPic()
      /**
       * 为map添加鼠标移动事件监听，当指向标注时改变鼠标光标状态
       */
      this.map.on("pointermove", (e) => {
        var pixel = this.map.getEventPixel(e.originalEvent)
        var hit = this.map.hasFeatureAtPixel(pixel)
        this.map.getTargetElement().style.cursor = hit ? "pointer" : ""
      })
      /**
       * 为map添加点击事件监听，渲染弹出popup
       */
      this.map.on("click", (evt) => {
        //判断当前单击处是否有要素，捕获到要素时弹出popup
        var feature = this.map.forEachFeatureAtPixel(
          evt.pixel,
          (feature, layer) => {
            return feature
          }
        )
        if (feature) {
          let popup = new ol.Overlay(
            /** @type {olx.OverlayOptions} */
            ({
              //要转换成overlay的HTML元素
              element: this.$refs.popup_content,
              //当前窗口可见
              autoPan: true,
              //Popup放置的位置
              positioning: "bottom-center",
              //是否应该停止事件传播到地图窗口
              stopEvent: false,
              autoPanAnimation: {
                //当Popup超出地图边界时，为了Popup全部可见，地图移动的速度
                duration: 250,
              },
            })
          )
          this.popupContentShow = true
          popup.setPosition(evt.coordinate)
          this.map.addOverlay(popup)
        }
      })
    },
    addPic() {
      var createLabelStyle = function (feature) {
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
            opacity: 0.75,
            //图标的url
            src: require("@/assets/logo.png"),
          }),
        })
      }
      //实例化Vector要素，通过矢量图层添加到地图容器中
      var iconFeature = new ol.Feature({
        // geometry: new ol.geom.Point(ol.proj.transform([116.403, 39.924], 'EPSG:4326', 'EPSG:3857')),
        geometry: new ol.geom.Point(
          ol.proj.transform([116.403, 39.924], "EPSG:4326", "EPSG:3857")
        ),
      })

      iconFeature.setStyle(createLabelStyle(iconFeature))
      console.log(iconFeature)
      //矢量标注的数据源
      var vectorSource = new ol.source.Vector({
        features: [iconFeature],
      })
      //矢量标注图层
      var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
      })
      console.log(vectorLayer)
      this.map.addLayer(vectorLayer)
      this.moveToPosition([116.403, 39.924])
    },
    addText() {
      /**
       * 创建矢量标注样式函数,设置image为图标ol.style.Icon
       * @param {ol.Feature} feature 要素
       */
      var createLabelStyle = function (feature) {
        return new ol.style.Style({
          text: new ol.style.Text({
            //位置
            textAlign: "center",
            //基准线
            textBaseline: "middle",
            //文字样式
            font: "normal 14px 微软雅黑",
            //文本内容
            text: feature.get("name"),
            //文本填充样式（即文字颜色）
            fill: new ol.style.Fill({ color: "#aa3300" }),
            stroke: new ol.style.Stroke({ color: "#ffcc33", width: 2 }),
          }),
        })
      }

      //实例化Vector要素，通过矢量图层添加到地图容器中
      var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(
          ol.proj.transform([116.403, 39.924], "EPSG:4326", "EPSG:3857")
        ),
        //名称属性
        name: "北京市",
        //大概人口数（万）
        population: 2115,
      })
      iconFeature.setStyle(createLabelStyle(iconFeature))
      //矢量标注的数据源
      var vectorSource = new ol.source.Vector({
        features: [iconFeature],
      })
      //矢量标注图层
      var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
      })
      this.map.addLayer(vectorLayer)
      this.moveToPosition([116.403, 39.924])
    },
    addManyPoints() {
      console.log("点聚合")
    },
    addPicAndText() {
      /**
       * 创建矢量标注样式函数,设置image为图标ol.style.Icon
       * @param {ol.Feature} feature 要素
       */
      var createLabelStyle = function (feature) {
        return new ol.style.Style({
          image: new ol.style.Icon(
            /** @type {olx.style.IconOptions} */
            ({
              anchor: [0.5, 60],
              anchorOrigin: "top-right",
              anchorXUnits: "fraction",
              anchorYUnits: "pixels",
              offsetOrigin: "top-right",
              // offset:[0,10],
              //图标缩放比例
              // scale:0.5,
              //透明度
              opacity: 0.75,
              //图标的url
              src: require("@/assets/logo.png"),
            })
          ),
          text: new ol.style.Text({
            //位置
            textAlign: "center",
            //基准线
            textBaseline: "middle",
            //文字样式
            font: "normal 14px 微软雅黑",
            //文本内容
            text: feature.get("name"),
            //文本填充样式（即文字颜色）
            fill: new ol.style.Fill({ color: "#aa3300" }),
            stroke: new ol.style.Stroke({ color: "#ffcc33", width: 2 }),
          }),
        })
      }

      //实例化Vector要素，通过矢量图层添加到地图容器中
      var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(
          ol.proj.transform([116.403, 39.924], "EPSG:4326", "EPSG:3857")
        ),
        //名称属性
        name: "北京市",
        //大概人口数（万）
        population: 2115,
      })
      iconFeature.setStyle(createLabelStyle(iconFeature))
      //矢量标注的数据源
      var vectorSource = new ol.source.Vector({
        features: [iconFeature],
      })
      //矢量标注图层
      var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
      })
      this.map.addLayer(vectorLayer)
      this.moveToPosition([116.403, 39.924])
    },
  },
}
</script>

<style lang="less" scoped>
.home {
  .btns {
    width: 100%;
    height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    button {
      margin: 20px;
    }
  }
  .popup_content {
    .fater {
      width: 150px;
      height: 50px;
      background-color: aquamarine;
    }
  }

  #map {
    height: calc(100vh - 200px);
  }
}
</style>
