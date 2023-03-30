<template>
  <div class="home">
    <div class="btns">
      <el-button @click="addPoint">添加点</el-button>
      <el-button @click="addLine">添加线</el-button>
      <el-button @click="addPoint">添加面</el-button>
      <el-button @click="toPoint">定位到某个点</el-button>
      <div>选择进行绘制</div>
      <el-select v-model="selectValue" @change="selectChange">
        <el-option v-for="item in selectList" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
      
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
const selectList = [
  {
    label: '清空绘制图形',
    value: 'None'
  },
  {
    label: '点',
    value: 'Point'
  },
  {
    label: '线',
    value: 'LineString'
  }, {
    label: '多边形',
    value: 'Polygon'
  }
  , {
    label: '圆',
    value: 'Circle'
  }, {
    label: '正方形',
    value: 'Square'
  }
  , {
    label: '长方形',
    value: 'Box'
  }
]
import * as ol from 'openlayers'
export default {
  data () {
    return {
      map: null,
      selectList: selectList,
      selectValue: 'None',
      draw: '',
      source: '',
      vector: ''
    }
  },
  mounted () {
    // 生成地图
    this.initMap()
    // 生成一个绘制层，用于地图绘制
    this.initDraw()
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

      this.map.getView().animate({
        //将地理坐标转为投影坐标
        center: ol.proj.transform([116.403, 39.924], 'EPSG:4326', 'EPSG:3857'),
        duration: 500,
        zoom: 14
      });
    },
    addLine () {
      //创建一个线
      var Line = new ol.Feature({
        geometry: new ol.geom.LineString([ol.proj.transform([116.403, 39.924], 'EPSG:4326', 'EPSG:3857'), ol.proj.transform([116.503, 39.994], 'EPSG:4326', 'EPSG:3857')])
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
    },
    toPoint () {
      //这里给动画设置一个初始值
      this.map.getView().animate({
        //将地理坐标转为投影坐标
        center: ol.proj.transform([117.403, 42.924], 'EPSG:4326', 'EPSG:3857'),
        duration: 1000,
        zoom: 12
      });
    },
    // toDraw () {
    //   // 添加绘制工具
    //   this.addInteraction()
    // },
    initDraw () {
      //实例化一个矢量图层Vector作为绘制层
      this.source = new ol.source.Vector({ wrapX: false });
      this.vector = new ol.layer.Vector({
        source: this.source,
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          }),
          stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 10
          }),
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
              color: '#ffcc33'
            })
          })
        })
      });
      //将绘制层添加到地图容器中
      this.map.addLayer(this.vector);
    },

    //根据绘制类型进行交互绘制图形处理
    addInteraction () {
      let type
      //绘制对象
      if (this.selectValue !== 'None') {
        type = this.selectValue
        if (this.source == null) {
          this.source = new ol.source.Vector({ wrapX: false });
          //添加绘制层数据源
          this.vector.setSource(this.source);
        }
        var geometryFunction, maxPoints;
        if (this.selectValue === 'Square') {
          type = 'Circle';
          //正方形图形（圆）
          geometryFunction = ol.interaction.Draw.createRegularPolygon(4);

        } else if (this.selectValue === 'Box') {
          type = 'LineString';
          maxPoints = 2;
          geometryFunction = function (coordinates, geometry) {
            if (!geometry) {
              //多边形
              geometry = new ol.geom.Polygon(null);
            }
            var start = coordinates[0];
            var end = coordinates[1];
            geometry.setCoordinates([
              [start, [start[0], end[1]], end, [end[0], start[1]], start]
            ]);
            return geometry;
          };
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
          maxPoints: maxPoints
        });
        this.map.addInteraction(this.draw)
      }
      else {
        // console.log(111)
        this.source = null;
        //清空绘制图形
        this.vector.setSource(this.source);
      }
    },
    selectChange () {
      //移除绘制图形
      this.map.removeInteraction(this.draw);
      //添加交互绘制功能控件
      this.addInteraction();
    },
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