<template>
  <div class="home">
    <div class="btns">
      <el-button @click="addPoint">添加点</el-button>
      <el-button @click="addLine">添加线</el-button>
      <el-button @click="addArea">添加面</el-button>
      <el-button @click="toPoint">定位到某个点</el-button>
      <div>选择进行绘制</div>
      <el-select v-model="selectValue" @change="selectChange">
        <el-option v-for="item in selectList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
      </el-select>

      <el-button @click="addPic">添加图片标注</el-button>
      <el-button @click="addText">添加文字标注</el-button>
      <el-button @click="addPicAndText">添加图文标注</el-button>
      <el-button @click="addPopup">添加popup</el-button>
      <el-button @click="addPointAndView">轨迹回放</el-button>
      <el-button @click="addHeatmap">添加热力图</el-button>
      <el-button @click="addManyPoints">添加点聚合地图</el-button>
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
    label: '清空绘制图形',
    value: 'None',
  },
  {
    label: '点',
    value: 'Point',
  },
  {
    label: '线',
    value: 'LineString',
  },
  {
    label: '多边形',
    value: 'Polygon',
  },
  {
    label: '圆',
    value: 'Circle',
  },
  {
    label: '正方形',
    value: 'Square',
  },
  {
    label: '长方形',
    value: 'Box',
  },
]
import * as ol from 'openlayers'
import heatData from './heatData'
export default {
  data() {
    return {
      map: null,
      selectList: selectList,
      selectValue: 'None',
      draw: '',
      source: '',
      vector: '',
      popupContentShow: false,
      layerList: []
    }
  },
  mounted() {
    // 生成地图
    this.initMap()
    // 生成一个绘制层，用于地图绘制
    this.initDraw()
  },
  methods: {
    clearMap() {
      if (this.layerList.length) {
        this.layerList.forEach(item => {
          this.map.removeLayer(item)
        })
      }
      this.map.getOverlays().clear()
    },
    initMap() {
      var projection = ol.proj.get('EPSG:3857')
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
            return ''
          }
          var z = tileCoord[0]
          var x = tileCoord[1]
          var y = tileCoord[2]

          if (x < 0) {
            x = 'M' + -x
          }
          if (y < 0) {
            y = 'M' + -y
          }
          return 'http://online3.map.bdimg.com/onlinelabel/?qt=tile&x=' + x + '&y=' + y + '&z=' + z + '&styles=pl&udt=20151021&scaler=1&p=1'
        },
      })
      //百度地图
      var baidu_layer = new ol.layer.Tile({
        source: baidu_source,
      })
      //地图容器
      this.map = new ol.Map({
        target: 'map',
        layers: [baidu_layer],
        view: new ol.View({
          center: ol.proj.transform([116.403, 39.924], 'EPSG:4326', 'EPSG:3857'),
          zoom: 12,
          minZoom: 3,
        }),
      })
    },
    moveToPosition(postion, zoom = 14) {
      this.map.getView().animate({
        //将地理坐标转为投影坐标
        center: ol.proj.transform(postion, 'EPSG:4326', 'EPSG:3857'),
        duration: 500,
        zoom: zoom,
      })
    },
    addPoint() {
      this.clearMap()
      //创建一个点
      var point = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.transform([116.403, 39.924], 'EPSG:4326', 'EPSG:3857')),
      })
      //设置点1的样式信息
      point.setStyle(
        new ol.style.Style({
          //填充色
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)',
          }),
          //边线颜色
          stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 2,
          }),
          //形状
          image: new ol.style.Circle({
            radius: 17,
            fill: new ol.style.Fill({
              color: '#ffcc33',
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

      // 移动位置
      this.moveToPosition([116.403, 39.924])

      // 将已添加的图层装起来
      this.layerList.push(vector)
      // const allLayers = this.map.getAllLayers()
      // console.log(allLayers);
    },
    addLine() {
      // 清除绘制的东西
      this.clearMap()
      //创建一个线
      var Line = new ol.Feature({
        geometry: new ol.geom.LineString([ol.proj.transform([116.403, 39.924], 'EPSG:4326', 'EPSG:3857'), ol.proj.transform([116.503, 39.994], 'EPSG:4326', 'EPSG:3857')]),
      })

      //设置线的样式
      Line.setStyle(
        new ol.style.Style({
          //填充色
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)',
          }),
          //边线颜色
          stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 5,
          }),
          //形状
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
              color: '#ffcc33',
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
      // 将已添加的图层装起来
      this.layerList.push(vector)
    },
    toPoint() {
      //这里给动画设置一个初始值
      this.map.getView().animate({
        //将地理坐标转为投影坐标
        center: ol.proj.transform([117.403, 42.924], 'EPSG:4326', 'EPSG:3857'),
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
            color: 'rgba(255, 255, 255, 0.2)',
          }),
          stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 10,
          }),
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
              color: '#ffcc33',
            }),
          }),
        }),
      })
      //将绘制层添加到地图容器中
      this.map.addLayer(this.vector)
      // 将已添加的图层装起来
      this.layerList.push(this.vector)
    },

    //根据绘制类型进行交互绘制图形处理
    addInteraction() {
      let type
      //绘制对象
      if (this.selectValue !== 'None') {
        type = this.selectValue
        if (this.source == null) {
          this.source = new ol.source.Vector({ wrapX: false })
          //添加绘制层数据源
          this.vector.setSource(this.source)
        }
        var geometryFunction, maxPoints
        if (this.selectValue === 'Square') {
          type = 'Circle'
          //正方形图形（圆）
          geometryFunction = ol.interaction.Draw.createRegularPolygon(4)
        } else if (this.selectValue === 'Box') {
          type = 'LineString'
          maxPoints = 2
          geometryFunction = function (coordinates, geometry) {
            if (!geometry) {
              //多边形
              geometry = new ol.geom.Polygon(null)
            }
            var start = coordinates[0]
            var end = coordinates[1]
            geometry.setCoordinates([[start, [start[0], end[1]], end, [end[0], start[1]], start]])
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
      // 清除绘制的东西
      this.clearMap()
      //根据范围获取多边形
      var Rectangle = new ol.Feature({
        geometry: new ol.geom.Polygon.fromExtent([16208725.0, 3035304.0, 9841418.0, 5068487.0]),
      })

      Rectangle.setStyle(
        new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'rgba(33,33,33,0.5)',
          }),
          stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 4,
          }),
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
              color: '#ffcc33',
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
      
      this.moveToPosition([105.403, 35.924], 4)
       // 将已添加的图层装起来
       this.layerList.push(vector)
    },
    addPointAndView() {
      // 清除绘制的东西
      this.clearMap()
      this.moveToPosition([116.403, 39.924], 4)
      var Coordinates = new Array()
      Coordinates.push(
        ol.proj.transform([117.403, 42.924], 'EPSG:4326', 'EPSG:3857'),
        ol.proj.transform([117.403, 41.924], 'EPSG:4326', 'EPSG:3857'),
        ol.proj.transform([117.403, 40.924], 'EPSG:4326', 'EPSG:3857'),
        ol.proj.transform([117.403, 38.924], 'EPSG:4326', 'EPSG:3857'),
        ol.proj.transform([117.403, 37.924], 'EPSG:4326', 'EPSG:3857'),
        ol.proj.transform([117.403, 32.924], 'EPSG:4326', 'EPSG:3857'),
        ol.proj.transform([127.403, 42.924], 'EPSG:4326', 'EPSG:3857'),
        ol.proj.transform([127.403, 52.924], 'EPSG:4326', 'EPSG:3857'),
        ol.proj.transform([137.403, 49.924], 'EPSG:4326', 'EPSG:3857')
      )
      let passCoordinate = []
      //将离散点构建成一条折线
      var route = new ol.geom.LineString(Coordinates)
      // -----------主要是把其中的经过的点都拿出来-----------------------------
      let trackLineLen = route.getLength()
      let pointCount = trackLineLen / (this.map.getView().getResolution() * 15)
      for (let i = 1; i < pointCount; i++) {
        passCoordinate.push(route.getCoordinateAt(i / pointCount))
      }
      passCoordinate.unshift(Coordinates[0])
      passCoordinate.push(Coordinates[Coordinates.length - 1])
      //获取直线的坐标
      // var routeCoords = route.getCoordinates()
      var routeCoords = passCoordinate
      // -----------主要是把其中的经过的点都拿出来-----------------------------
      var routeLength = routeCoords.length

      var routeFeature = new ol.Feature({
        type: 'route',
        geometry: route,
      })
      var geoMarker = new ol.Feature({
        type: 'geoMarker',
        geometry: new ol.geom.Point(routeCoords[0]),
      })
      var startMarker = new ol.Feature({
        type: 'icon',
        geometry: new ol.geom.Point(routeCoords[0]),
      })
      var endMarker = new ol.Feature({
        type: 'icon',
        geometry: new ol.geom.Point(routeCoords[routeLength - 1]),
      })

      var styles = {
        route: new ol.style.Style({
          stroke: new ol.style.Stroke({
            width: 6,
            color: [237, 212, 0, 0.8],
          }),
        }),
        icon: new ol.style.Style({
          image: new ol.style.Icon({
            anchor: [0.5, 1],
            src: require('@/assets/icon_address@2x.png'),
          }),
        }),
        geoMarker: new ol.style.Style({
          image: new ol.style.Circle({
            radius: 7,
            // snapToPixel: false,
            fill: new ol.style.Fill({ color: 'black' }),
            stroke: new ol.style.Stroke({
              color: 'white',
              width: 2,
            }),
          }),
        }),
      }

      var animating = false
      var speed, now
      var vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
          features: [routeFeature, geoMarker, startMarker, endMarker],
        }),
        style: function (feature) {
          //如果动画是激活的就隐藏geoMarker
          if (animating && feature.get('type') === 'geoMarker') {
            return null
          }
          return styles[feature.get('type')]
        },
      })
      this.map.addLayer(vectorLayer)
       // 将已添加的图层装起来
      this.layerList.push(vectorLayer)
      var moveFeature = event => {
        var vectorContext = event.vectorContext
        var frameState = event.frameState
        if (animating) {
          var elapsedTime = frameState.time - now
          //通过增加速度，来获得lineString坐标
          var index = Math.round((speed * elapsedTime) / 1000)

          if (index >= routeLength) {
            stopAnimation(true)
            return
          }

          var currentPoint = new ol.geom.Point(routeCoords[index])
          var feature = new ol.Feature(currentPoint)
          vectorContext.drawFeature(feature, styles.geoMarker)
        }
        //继续动画效果
        this.map.render()
      }
      const startAnimation = () => {
        if (animating) {
          stopAnimation(false)
        } else {
          animating = true
          now = new Date().getTime()
          speed = 400
          // startButton.textContent = '结束运动'
          //隐藏geoMarker
          geoMarker.setStyle(null)
          //设置显示范围
          this.map.getView().setCenter(ol.proj.transform([116.403, 39.924], 'EPSG:4326', 'EPSG:3857'))
          this.map.on('postcompose', moveFeature)
          this.map.render()
        }
      }
      const stopAnimation = ended => {
        animating = false
        // startButton.textContent = '开始运动'

        //如果动画取消就开始动画
        var coord = ended ? routeCoords[routeLength - 1] : routeCoords[0]
        /** @type {ol.geom.Point} */
        geoMarker.getGeometry().setCoordinates(coord)
        //移除监听
        this.map.un('postcompose', moveFeature)
      }
      setTimeout(() => {
        startAnimation()
      }, 2000)
    },
    addPopup() {
      // 清除绘制的东西
      this.clearMap()
      this.addPic()
      alert('请点击该图片触发popup')
      /**
       * 为map添加鼠标移动事件监听，当指向标注时改变鼠标光标状态
       */
      this.map.on('pointermove', e => {
        var pixel = this.map.getEventPixel(e.originalEvent)
        var hit = this.map.hasFeatureAtPixel(pixel)
        this.map.getTargetElement().style.cursor = hit ? 'pointer' : ''
      })
      /**
       * 为map添加点击事件监听，渲染弹出popup
       */
      this.map.on('click', evt => {
        //判断当前单击处是否有要素，捕获到要素时弹出popup
        var feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
          return feature
        })
        if (feature) {
          let popup = new ol.Overlay(
            /** @type {olx.OverlayOptions} */
            ({
              //要转换成overlay的HTML元素
              element: this.$refs.popup_content,
              //当前窗口可见
              autoPan: true,
              //Popup放置的位置
              positioning: 'center-center',
              //是否应该停止事件传播到地图窗口
              stopEvent: false,
              autoPanAnimation: {
                //当Popup超出地图边界时，为了Popup全部可见，地图移动的速度
                duration: 250,
              },
            })
          )
          this.popupContentShow = true
          // 这里设置这个位置放大会偏移
          popup.setPosition(evt.coordinate)
          // 设置真实的地理坐标位置就不会偏移了
          // popup.setPosition(ol.proj.transform([116.403, 39.924], 'EPSG:4326', 'EPSG:3857'))
          this.map.addOverlay(popup)
        }
      })
    },
    addPic() {
      // 清除绘制的东西
      this.clearMap()
      var createLabelStyle = function (feature) {
        return new ol.style.Style({
          /**{olx.style.IconOptions}类型*/
          image: new ol.style.Icon({
            anchor: [0.5, 80],
            anchorOrigin: 'top-right',
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            offsetOrigin: 'top-right',
            // offset:[0,10],
            //图标缩放比例
            // scale:0.5,
            //透明度
            opacity: 0.75,
            //图标的url
            src: require('@/assets/logo.png'),
          }),
        })
      }
      //实例化Vector要素，通过矢量图层添加到地图容器中
      var iconFeature = new ol.Feature({
        // geometry: new ol.geom.Point(ol.proj.transform([116.403, 39.924], 'EPSG:4326', 'EPSG:3857')),
        geometry: new ol.geom.Point(ol.proj.transform([116.403, 39.924], 'EPSG:4326', 'EPSG:3857')),
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
       // 将已添加的图层装起来
       this.layerList.push(vectorLayer)
    },
    addText() {
      // 清除绘制的东西
      this.clearMap()
      /**
       * 创建矢量标注样式函数,设置image为图标ol.style.Icon
       * @param {ol.Feature} feature 要素
       */
      var createLabelStyle = function (feature) {
        return new ol.style.Style({
          text: new ol.style.Text({
            //位置
            textAlign: 'center',
            //基准线
            textBaseline: 'middle',
            //文字样式
            font: 'normal 14px 微软雅黑',
            //文本内容
            text: feature.get('name'),
            //文本填充样式（即文字颜色）
            fill: new ol.style.Fill({ color: '#aa3300' }),
            stroke: new ol.style.Stroke({ color: '#ffcc33', width: 2 }),
          }),
        })
      }

      //实例化Vector要素，通过矢量图层添加到地图容器中
      var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.transform([116.403, 39.924], 'EPSG:4326', 'EPSG:3857')),
        //名称属性
        name: '北京市',
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
      // 将已添加的图层装起来
      this.layerList.push(vectorLayer)
    },
    addHeatmap() {
      // 清除绘制的东西
      this.clearMap()
      this.moveToPosition([116.403, 39.924], 4)
      //创建一个Heatmap图层
      var vector = new ol.layer.Heatmap({
        //矢量数据源（读取本地的KML数据）
        source: new ol.source.Vector({
          // url: '../../data/kml/2012_Earthquakes_Mag5.kml',
          // format: new ol.format.KML({
          //   extractStyles: false,
          // }),
          features: new ol.format.GeoJSON().readFeatures(heatData, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857',
          }),
        }),
        //热点半径
        radius: parseInt(15, 10),
        //模糊尺寸
        blur: parseInt(25, 10),
      })
      //为矢量数据源添加addfeature事件监听
      // vector.getSource().on('addfeature', function (event) {
      //   // 示例数据2012_Earthquakes_Mag5.kml，可从其地标名称提取地震信息
      //   //要素的名称属性
      //   var name = event.feature.get('name')
      //   //得到要素的地震震级属性（magnitude）
      //   var magnitude = parseFloat(name.substr(2))
      //   //设置要素的weight属性
      //   event.feature.set('weight', magnitude - 5)
      // })
      this.map.addLayer(vector)
      // 将已添加的图层装起来
      this.layerList.push(vector)
    },
    addManyPoints() {
      // 清除绘制的东西
      this.clearMap()
      this.moveToPosition([116.403, 39.924], 7)
      //此示例创建10000个要素
      var count = 1000
      var features = new Array(count)
      for (var i = 0; i < count; ++i) {
        // var coordinates = [2 * e * Math.random() - e, 2 * e * Math.random() - e]
        var coordinates = ol.proj.transform([Math.random()*100+100, Math.random()*10+35], 'EPSG:4326', 'EPSG:3857')
        // console.log(coordinates)
        features[i] = new ol.Feature(new ol.geom.Point(coordinates))
      }
      //矢量要素数据源
      var source = new ol.source.Vector({
        features: features,
      })
      //聚合标注数据源
      var clusterSource = new ol.source.Cluster({
        distance: 40,
        source: source,
      })
      //加载聚合标注的矢量图层
      var styleCache = {}
      var clusters = new ol.layer.Vector({
        source: clusterSource,
        style: function (feature, resolution) {
          var size = feature.get('features').length
          var style = styleCache[size]
          if (!style) {
            style = [
              new ol.style.Style({
                image: new ol.style.Circle({
                  radius: 20,
                  stroke: new ol.style.Stroke({
                    color: '#fff',
                  }),
                  fill: new ol.style.Fill({
                    color: '#3399CC',
                  }),
                }),
                text: new ol.style.Text({
                  text: size.toString(),
                  fill: new ol.style.Fill({
                    color: '#fff',
                  }),
                }),
              }),
            ]
            styleCache[size] = style
          }
          return style
        },
      })
      this.map.addLayer(clusters)
       // 将已添加的图层装起来
       this.layerList.push(clusters)
      // 下面的代码是让鼠标变成小手，并且有点击事件
      this.map.on('pointermove', e => {
        var pixel = this.map.getEventPixel(e.originalEvent)
        var hit = this.map.hasFeatureAtPixel(pixel)
        this.map.getTargetElement().style.cursor = hit ? 'pointer' : ''
      })
      /**
       * 为map添加点击事件监听，渲染弹出popup
       */
      this.map.on('click', evt => {
        //判断当前单击处是否有要素，捕获到要素时弹出popup
        var feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
          return feature
        })
        if (feature) {
          let popup = new ol.Overlay(
            /** @type {olx.OverlayOptions} */
            ({
              //要转换成overlay的HTML元素
              element: this.$refs.popup_content,
              //当前窗口可见
              autoPan: true,
              //Popup放置的位置
              positioning: 'bottom-center',
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
              anchorOrigin: 'top-right',
              anchorXUnits: 'fraction',
              anchorYUnits: 'pixels',
              offsetOrigin: 'top-right',
              // offset:[0,10],
              //图标缩放比例
              // scale:0.5,
              //透明度
              opacity: 0.75,
              //图标的url
              src: require('@/assets/logo.png'),
            })
          ),
          text: new ol.style.Text({
            //位置
            textAlign: 'center',
            //基准线
            textBaseline: 'middle',
            //文字样式
            font: 'normal 14px 微软雅黑',
            //文本内容
            text: feature.get('name'),
            //文本填充样式（即文字颜色）
            fill: new ol.style.Fill({ color: '#aa3300' }),
            stroke: new ol.style.Stroke({ color: '#ffcc33', width: 2 }),
          }),
        })
      }

      //实例化Vector要素，通过矢量图层添加到地图容器中
      var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.transform([116.403, 40.024], 'EPSG:4326', 'EPSG:3857')),
        //名称属性
        name: '北京市',
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
        // 将已添加的图层装起来
        this.layerList.push(vectorLayer)
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
