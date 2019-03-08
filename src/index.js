import '../style/css/charts.scss';
import * as d3 from 'd3';
import _ from 'lodash';

/** 图表类 */
class BCharts {

  /**
   * @constructs BCharts
   * @param {String} id 画布绘制的位置，如"#eleId"、".eleClass"等
   */
  constructor(id) {
    //画布绘制的位置
    this.element = id;
    //画布
    this.svg = undefined;
    //画布边距
    this.padding = {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    };
    //悬浮游标类型
    this.hoverCursorType = "line";
    //图表数据和配置
    this.config = [];
    //资源路径
    this.resourcePath = "static/resources/";
    //地图geojson文件位置
    this.geoJson = "";
    //x轴属性
    this.xAxis = [{
      type: "category",
      gridLine: true,
      boundaryGap: true,
      position: "bottom",
      lineType: "solid",
      show: true,
      border: true
    }];
    //Y轴属性
    this.yAxis = [{
      type: "value",
      gridLine: true,
      boundaryGap: true,
      position: "left",
      lineType: "solid",
      show: true,
      border: true
    }];
    //数据区域控件
    this.dataZoom = undefined;
    //鼠标悬浮游标
    this.hoverCursor = undefined;
    //鼠标悬浮提示标题
    this.hoverTitle = undefined;
    //鼠标悬浮提示
    this.hoverText = undefined;
    //悬浮提示设置
    this.textProps = {};
    //标尺
    this.clickCursor = undefined;
    //默认选中标尺
    this.defaultCursor = undefined;
    //点击标尺
    this.onCursorClick = undefined;
    //散点图阈值控制颜色
    this.scatterThreshold = undefined;
    //地图阈值控制颜色
    this.mapThreshold = undefined;
    //图表属性
    this.property = {
      type: "normal"
    };
    //发起攻击地（外国或者本地发起攻击）
    this.threatCity = [];
    this.clickTimer = null;
    this.relationFilter = {
      relationType: [],
      type: []
    };
  }

  /**
   * @description 设置图表数据和配置
   * @method setConfig
   * @param {Object} config 图表数据和配置
   * @return {BCharts} 图表对象
   * @since 2016年10月10日18:57:47
   * @author jason
   * @example
   * new BCharts("#eleId")
   *  .setConfig([{
   *    //图表名
   *    name: "chart1"
   *    //line为折线或曲线图，bar为柱形图，scatter为散点图，"map-scatter"为地图(散点)，pie为饼图
   *    type:"line",
   *    //使用坐标轴配置中的第几个X轴(见{@link setXAxis})，不设置默认为0
   *    xAxis: 0,
   *    //使用坐标轴配置中的第几个Y轴(见{@link setYAxis})，不设置默认为0
   *    yAxis: 0,
   *    //图表颜色，不设置默认为#22C3F7
   *    color: "#fff",
   *    //type为line时起效，是否显示折线图中的点，不设置默认为true
   *    showPoint: false,
   *    //type为line时起效，设置渐变效果，不设置默认不渐变
   *    gradient: {
   *      //vertical为垂直方向渐变，horizontal为水平方向渐变
   *      type: "vertical",
   *      //渐变从 #22C3F7 到 #7CDCCE
   *      color: ["#22C3F7", "#7CDCCE"]
   *    },
   *    //type为line时起效，设置折线图效果，monotone为曲线，不设置默认为折线(参考d3.js d3.svg.line().interpolate())
   *    interpolate: "monotone"
   *    //type为line时起效，线条宽度，不设置默认为1
   *    lineWidth: 2,
   *    //type为line时起效，area为绘制封闭区域，不设置默认为不绘制区域
   *    lineType: "area",
   *    //type为bar时起效，柱形图宽度，不设置默认为0.8
   *    barWidth: 0.5,
   *    //type为bar时起效，一格宽度以多少个柱形平分，不设置默认根据数据组数平均分配
   *    barSplit: 1,
   *    //type为scatter或"map-scatter"时起效，scatter指散点大小，不设置默认为6；"map-scatter"指散点最大尺寸，不设置默认为10
   *    pointSize: 7,
   *    //鼠标悬浮到 折线图点、散点、地图散点上时是否添加缩放效果，不设置默认为true
   *    pinch: true,
   *    //注册事件，事件对象：柱形图为柱形，折线图为折线点，散点图为散点，地图散点图为散点
   *    //点击事件
   *    onClick: fucntion(param){},
   *    //鼠标悬浮事件
   *    onMouseover: function(param){},
   *    //鼠标移出事件
   *    onMouseout: function(param){},
   *    //鼠标移动事件
   *    onMousemove: function(param){},
   *    //图表数据
   *    data: [{
   *      x:1,
   *      y"2"
   *    },{
   *      x:2,
   *      y"3"
   *    }]
   *  },{
   *    name: "chart2"
   *    type: "line",
   *    //图表数据
   *    data: [{
   *      x:1,
   *      y:"2"
   *    },{
   *      x:2,
   *      y:"3"
   *    }]
   *  }])
   *  .build();
   *
   * */
  setConfig(config) {

    let configs = [];
    let configOrg = false;
    if (this.config.length > 0) {
      configOrg = this.config;
    }
    if (config instanceof Array) {
      //设置默认属性
      for (let [i, item] of config.entries()) {
        configs.push(this._defaultConfig(item, configOrg ? configOrg[i] : configOrg));
      }
    } else {
      configs.push(this._defaultConfig(config, configOrg ? configOrg[0] : configOrg));
    }
    this.config = configs;
    return this;
  }

  //添加默认配置
  _defaultConfig(item, configOrg) {
    let config = {};
    if (configOrg) {
      config = configOrg;
    } else {
      config = item;
    }
    config.dataAll = item.data ? item.data : (config.dataAll ? config.dataAll : []);
    config.data = item.data ? item.data : (config.data ? config.data : []);
    config.name = item.name ? item.name : (config.name ? config.name : "");
    config.xAxis = item.xAxis ? item.xAxis : (config.xAxis ? config.xAxis : 0);
    config.yAxis = item.yAxis ? item.yAxis : (config.yAxis ? config.yAxis : 0);
    config.color = item.color ? item.color : (config.color ? config.color : "#22C3F7");
    config.showPoint = item.showPoint !== undefined ? item.showPoint :
      (config.showPoint !== undefined ? config.showPoint : true);
    return config;
  }

  /**
   *
   * @description 设置地图geojson文件位置
   * @method setGeoJson
   * @param {String} path 地图geojson文件路径
   * @return {BCharts} 图表对象
   * @since 2016年10月11日15:38:03
   * @author jason
   * @example
   *  new BCharts("#eleId")
   *    .setConfig({
   *      name: "map",
   *      type: "map-scatter",
   *      pointSize: 10,
   *      data: [
   *        //值分别为[经度, 纬度, 数值(决定散点大小), 其他值(可以有多个，注册事件时返回使用)]
   *        [100, 108, 7, param1, param1, ...],
   *        [101, 102, 2, param1, param1, ...]
   *      ]
   *    })
   *    //设置地图路径
   *    .setGeoJson("map-json/china.json")
   *    .build();
   *
   * */
  setGeoJson(path) {
    this.geoJson = path;
    return this;
  }

  /**
   *
   * @description 设置x轴属性
   * @method setXAxis
   * @param {Object} xAxis x轴属性
   * @return {BCharts} 图表对象
   * @since 2016年10月11日15:57:58
   * @author jason
   * @example
   *  new BCharts("#eleId")
   *    .setConfig({
   *      name: "line",
   *      type: "line",
   *      //图表数据
   *      data: [{
   *        x:1,
   *        y:"2"
   *      },{
   *        x:2,
   *        y:"3"
   *      }]
   *    })
   *    //设置x轴属性
   *    .setXAxis([{
   *      //类型，category为类，value为数值，time为时间(x轴数据为时间戳)，不设置默认为category
   *      type: "category",
   *      //x轴位置，bottom为下方，top为上方，不设置默认为bottom
   *      position: "bottom",
   *      //显示多少个刻度，不设置默认为数据数量
   *      markCount: 5,
   *      //是否显示X轴网格，不设置默认为true
   *      gridLine: true,
   *      //是否显示X轴边界，不设置默认为true
   *      border: true,
   *      //是否以相邻刻度中心为图表单位中心，默认为true(参考echart的boundaryGap)
   *      boundaryGap: true,
   *      //是否显示x轴刻度，不设置默认为true
   *      show: false,
   *      //坐标轴刻度文字对齐设置，left为左对齐，right为右对齐，inside为在图表内部，不设置默认为middle
   *      textPos: "left",
   *      //坐标轴翻转(默认从左到右，flip为true时为从右到左)，不设置默认为false
   *      flip: true,
   *      //格式化坐标轴刻度
   *      format: function(x) {
   *        return x+"K";
   *      }
   *      //type为value时起效，坐标轴最大值，不设置默认自动计算图表数据最大值
   *      maxValue: 100,
   *      //type为value时起效，坐标轴最小值，不设置默认为0
   *      minValue: 0,
   *      //type为value时起效，坐标轴刻度显示设置，all为显示所有刻度，end为只显示第一个和最后一个刻度，默认为end
   *      markType: "all",
   *      //坐标轴线类型，solid为实线，dash为虚线，不设置默认为solid
   *      lineType: "dash"
   *    }])
   *    .build();
   * */
  setXAxis(xAxis) {
    let axis = [];
    if (xAxis instanceof Array) {
      //设置默认属性
      for (let item of xAxis) {
        axis.push(this._defaultAxis(item, "X"));
      }
    } else {
      axis.push(this._defaultAxis(xAxis, "X"));
    }
    this.xAxis = axis;
    return this;
  }

  /**
   *
   * @description 设置x轴属性
   * @method setYAxis
   * @param {Object} yAxis y轴属性
   * @return {BCharts} 图表对象
   * @since 2016年10月11日16:37:56
   * @author jason
   * @example
   *  new BCharts("#eleId")
   *    .setConfig({
   *      name: "line",
   *      type: "line",
   *      //图表数据
   *      data: [{
   *        x:1,
   *        y:"2"
   *      },{
   *        x:2,
   *        y:"3"
   *      }]
   *    })
   *    //设置x轴属性
   *    .setYAxis([{
   *      //类型，category为类，value为数值，time为时间(y轴数据为时间戳)，不设置默认为value
   *      type: "value",
   *      //y轴位置，left为左侧，right为右侧，不设置默认为left
   *      position: "left",
   *      //显示多少个刻度，不设置默认为5
   *      markCount: 5,
   *      //是否显示Y轴网格，不设置默认为true
   *      gridLine: true,
   *      //是否显示Y轴边界，不设置默认为true
   *      border: true,
   *      //是否以相邻刻度中心为图表单位中心，默认为true(参考echart的boundaryGap)
   *      boundaryGap: true,
   *      //是否显示y轴刻度，不设置默认为true
   *      show: false,
   *      //坐标轴刻度文字对齐设置，left为左对齐，middle为中对齐，inside为在图表内部，不设置默认为right
   *      textPos: "left",
   *      //坐标轴翻转(默认从下到上，flip为true时为从上到下)，不设置默认为false
   *      flip: true,
   *      //格式化坐标轴刻度
   *      format: function(y) {
   *        return y+"S";
   *      }
   *      //type为value时起效，坐标轴最大值，不设置默认自动计算图表数据最大值
   *      maxValue: 100,
   *      //type为value时起效，坐标轴最小值，不设置默认为0
   *      minValue: 0,
   *      //type为value时起效，坐标轴刻度显示设置，all为显示所有刻度，end为只显示第一个和最后一个刻度，默认为end
   *      markType: "all",
   *      //坐标轴线类型，solid为实线，dash为虚线，不设置默认为solid
   *      lineType: "dash"
   *    }])
   *    .build();
   *
   * */
  setYAxis(yAxis) {
    let axis = [];
    if (yAxis instanceof Array) {
      //设置默认属性
      for (let item of yAxis) {
        axis.push(this._defaultAxis(item, "Y"));
      }
    } else {
      axis.push(this._defaultAxis(yAxis, "Y"));
    }
    this.yAxis = axis;
    return this;
  }

  //坐标轴默认属性设置
  _defaultAxis(item, type) {
    if (type === "X") {
      item.type = item.type === undefined ? "category" : item.type;
      item.position = item.position === undefined ? "bottom" : item.position;
    } else {
      item.type = item.type === undefined ? "value" : item.type;
      item.position = item.position === undefined ? "left" : item.position;
    }
    if (item.type === "category") {
      item.markCount = item.markCount === undefined ? "" : item.markCount;
    } else {
      item.markCount = item.markCount === undefined ? 5 : item.markCount;
    }
    item.gridLine = item.gridLine === undefined ? true : item.gridLine;
    item.border = item.border === undefined ? true : item.border;
    item.boundaryGap = item.boundaryGap === undefined ? true : item.boundaryGap;
    item.show = item.show === undefined ? true : item.show;
    item.lineType = item.lineType === undefined ? "solid" : item.lineType;
    return item;
  }

  /**
   *
   * @description 设置数据区域控件(config中type为"line"或"bar"时起效)
   * @method setDataZoom
   * @param {Object} dataZoom 数据区域设置
   * @return {BCharts} 图表对象
   * @since 2016年10月11日17:12:09
   * @author jason
   * @example
   *  new BCharts("#eleId")
   *    .setConfig({
   *      name: "line",
   *      type: "line",
   *      //图表数据
   *      data: [{
   *        x:1,
   *        y:"2"
   *      },{
   *        x:2,
   *        y:"3"
   *      }]
   *    })
   *    //设置数据区域
   *    .setDataZoom([{
   *      //以图表数据中的第几组数据作为标准，不设置默认为0
   *      dataIndex: 0,
   *      //数据区域类型，fixed为固定区域，scalable为可伸缩区域，默认为scalable
   *      type: "fixed",
   *      //刷新时刻，end为拖动结束时刷新，默认为拖动时刷新
   *      freshTime: "end",
   *      //start，end，width 最少存在两个，如果三个都有值，则取start和end
   *      //初始数据区域起始位置(百分比)
   *      start: 80,
   *      //初始数据区域结束位置(百分比)
   *      end: 100,
   *      //数据区域宽度(数据个数)
   *      width: 96,
   *      //数据区域与其他图表绑定
   *      bind: bChart,
   *      //数据区域变化事件，param:{minIndex,maxIndex}
   *      onChange: function(param){}
   *    }])
   *    .build();
   *
   * */
  setDataZoom(dataZoom) {
    dataZoom.dataIndex = dataZoom.dataIndex ? dataZoom.dataIndex : 0;
    this.dataZoom = dataZoom;
    return this;
  }

  /**
   *
   * @description 设置鼠标悬浮游标(config中type为"line"或"bar"时起效)
   * @method setHoverCursor
   * @param {Boolean} hoverCursor 数据区域设置
   * @return {BCharts} 图表对象
   * @since 2016年10月11日18:00:03
   * @author jason
   * @example
   *  new BCharts("#eleId")
   *    .setConfig({
   *      name: "line",
   *      type: "line",
   *      //图表数据
   *      data: [{x:1,y:"2"},{x:2,y:"3"}]
   *    })
   *    //设置是否显示悬浮游标
   *    .setHoverCursor(true)
   *    .build();
   *
   * */
  setHoverCursor(hoverCursor) {
    this.hoverCursor = hoverCursor;
    return this;
  }

  /**
   *
   * @description 设置鼠标悬浮文字标题(用于多组数据图表)
   * @method setHoverTitle
   * @param {Function} hoverTitle 鼠标悬浮文字标题
   * @return {BCharts} 图表对象
   * @since 2016年10月12日17:31:45
   * @author jason
   * @example
   *  new BCharts("#eleId")
   *    .setConfig([{
   *      name: "line1",
   *      type: "line",
   *      //图表数据
   *      data: [{x:1,y:"2"},{x:2,y:"3"}]
   *    },{
   *      name: "line2",
   *      type: "line",
   *      //图表数据
   *      data: [{x:1,y:"2"},{x:2,y:"3"}]
   *    }])
   *    //设置是否显示悬浮游标
   *    .setHoverTitle((params)=>{return params.x+"K";})
   *    .build();
   *
   * */
  setHoverTitle(hoverTitle) {
    this.hoverTitle = hoverTitle;
    return this;
  }

  /**
   *
   * @description 设置鼠标悬浮提示
   * @method setHoverText
   * @param {Function} hoverText 设置鼠标悬浮提示
   * @param {Object} textProps 设置鼠标悬浮文字配置
   * @return {BCharts} 图表对象
   * @since 2016年10月12日17:32:51
   * @author jason
   * @example
   *  new BCharts("#eleId")
   *    .setConfig([{
   *      name: "line1",
   *      type: "line",
   *      //图表数据
   *      data: [{x:1,y:"2"},{x:2,y:"3"}]
   *    },{
   *      name: "line2",
   *      type: "line",
   *      //图表数据
   *      data: [{x:1,y:"2"},{x:2,y:"3"}]
   *    }])
   *    //设置悬浮文字和配置，不设置默认无悬浮文字
   *    //textProps: textProps.posFree为true时，表示悬浮文字可以移出图表范围，不设置默认为不可移出图表范围
   *    .setHoverText(params=> {
   *      return [`访问量:${parseInt(params.y)}`, moment(Number(params.x)).format('YYYY.MM.DD HH:mm')];
   *    }, {posFree:true})
   *    .build();
   *
   * */
  setHoverText(hoverText, textProps) {
    this.hoverText = hoverText;
    if (textProps) {
      this.textProps = textProps;
    }
    return this;
  }

  /**
   *
   * @description 设置标尺
   * @method setClickCursor
   * @param {Array/Boolean} clickCursor Array:联动图表对象数组，Boolean为true显示标尺
   * @param {Object} defaultCursor 设置默认选中的标尺，不设置默认不选中
   * @param {Function} onCursorClick 点击标尺事件
   * @return {BCharts} 图表对象
   * @since 2016年10月12日18:04:27
   * @author jason
   * @example
   *
   *  let data = [{x:1,y:"2"},{x:2,y:"3"}];
   *  new BCharts("#eleId")
   *    .setConfig([{
   *      name: "line1",
   *      type: "line",
   *      //图表数据
   *      data
   *    },{
   *      name: "line2",
   *      type: "line",
   *      //图表数据
   *      data: [{x:1,y:"2"},{x:2,y:"3"}]
   *    }])
   *    //设置标尺
   *    .setClickCursor(true, data[0], function(param){
   *      //do something...
   *    })
   *    .build();
   *
   **/
  setClickCursor(clickCursor, defaultCursor, onCursorClick) {

    if (defaultCursor !== undefined) {
      this.defaultCursor = defaultCursor;
    }
    if (onCursorClick !== undefined) {
      this.onCursorClick = onCursorClick;
    }
    this.clickCursor = clickCursor;
    return this;
  }

  /**
   *
   * @description 设置散点图阈值控制颜色
   * @method setScatterThreshold
   * @param {Array} scatterThreshold 阈值和颜色
   * @return {BCharts} 图表对象
   * @since 2016年10月12日18:04:27
   * @author jason
   * @example
   *  new BCharts("#eleId")
   *    .setConfig([{
   *      name: "line",
   *      type: "line",
   *      //图表数据
   *      data: [{x:1,y:"2"},{x:2,y:"3"}]
   *    }])
   *    //设置阈值和颜色
   *    .setScatterThreshold([{
   *      // <=2时，颜色为"#FB435F"
   *      range: ["", 2],
   *      color: "#FB435F"
   *    },{
   *      // >=3 && <=10 时，颜色为 "white"
   *      range: [3, 10],
   *      color: "white"
   *    },{
   *      // >=11 时，颜色为 "#000"
   *      range: [11, ""],
   *      color: "#000"
   *    }])
   *    .build();
   *
   * */
  setScatterThreshold(scatterThreshold) {
    this.scatterThreshold = scatterThreshold;
    return this;
  }

  /**
   *
   * @description 设置图表属性(config中type为"bar"时起效)
   * @method setChartProperty
   * @param {Object} property 阈值和颜色
   * @return {BCharts} 图表对象
   * @since 2016年10月12日19:01:53
   * @author jason
   * @example
   *
   *  new BCharts("#eleId")
   *    .setConfig([{
   *      name: "line",
   *      type: "line",
   *      //图表数据
   *      data: [{
   *        x:1,
   *        y:"2",
   *        value: 3
   *      },{
   *        x:2,
   *        y:"3",
   *        value: 6
   *      }]
   *    }])
   *    //type为"dataZoom"标志该图表作为数据区域
   *    //start、end、width用法参考{@link setDataZoom}
   *    // 图表数据中的value > warningLine时，坐标轴下方会出现警告红点
   *    //数据区间发生变化时触发onChange事件
   *    //param: {data(区间内数据集合),minIndex,maxIndex}
   *    .setChartProperty({
   *      type: "dataZoom",
   *      end: 100,
   *      width: 20,
   *      warningLine: 4,
   *      onChange: function (param) {
   *        //do something
   *      }
   *    })
   *    .build();
   *
   * */
  setChartProperty(property) {
    this.property = property;
    return this;
  }

  /**
   *
   * @description 地图阈值控制颜色
   * @method setMapThreshold
   * @param {Object} mapThreshold 阈值和颜色
   * @return {BCharts} 图表对象
   * @since 2016年10月12日19:01:53
   * @author jason
   * @example
   *
   *  new BCharts("#eleId")
   *    .setConfig([{
   *      name: "map",
   *      type: "map-scatter",
   *      //图表数据
   *      data: [
   *        [100, 103, 30],
   *        [101, 109, 20],
   *        [103, 119, 21],
   *        [111, 108, 10]
   *      ]
   *    }])
   *    //设置地图阈值和颜色
   *    //type为range时，value代表排名，如:value为3，则代表前三报警
   *    //type为value时，value代表安全值，超过安全值则报警
   *    //color为报警时散点显示的颜色
   *    //animation为true时，表示报警显示动画，不设置默认为false
   *    .setMapThreshold({
   *      type: "range",
   *      value: 3,
   *      color: "#F97869",
   *      animation: true
   *    })
   *    .build();
   *
   * */
  setMapThreshold(mapThreshold) {
    this.mapThreshold = mapThreshold;
    return this;
  }

  /**
   *
   * @description 设置画布padding
   * @method setFixedPadding
   * @param {Object} fixedPadding 想要固定的各个方向的padding值
   * @return {BCharts} 图表对象
   * @since 2016年10月12日19:35:57
   * @author jason
   * @example
   *
   *  new BCharts("#eleId")
   *    .setConfig([{
   *      name: "line",
   *      type: "line",
   *      //图表数据
   *      data: [{x:1, y:"2"},{x:2,y:"3"}]
   *    }])
   *    //表示画布padding-top:0; padding-left:50px;，不设置默认根据坐标刻度自适应
   *    .setFixedPadding({
   *      top: 0,
   *      left 50
   *    })
   *    .build();
   *
   * */
  setFixedPadding(fixedPadding) {
    this.fixedPadding = fixedPadding;
    return this;
  }

  //设置导弹图配置
  setThreatMapConfig(threatMapConfig) {
    this.threatMapConfig = threatMapConfig;
    return this;
  }

  /**
   *
   * @description 根据配置绘制图表
   * @method build
   * @since 2016年10月12日19:35:57
   * @author jason
   * @example
   *
   *  new BCharts("#eleId")
   *    .setConfig([{
   *      name: "line",
   *      type: "line",
   *      //图表数据
   *      data: [{x:1, y:"2"},{x:2,y:"3"}]
   *    }])
   *    .build();
   *
   * */
  build() {
    let me = this;
    //try {
    //绘制画布
    if (me.config[0].type !== "3d-earth") {
      me._svgInit();
    }
    //地图不绘制坐标轴
    if (me.config[0].type === "bar"
      || me.config[0].type === "line"
      || me.config[0].type === "scatter"
      || me.config[0].type === "scatterPoint") {
      //获取坐标轴数据
      me._getAxisData();
      //绘制坐标轴
      me._initAxis();
    } else if (me.config[0].type === "treemaps") {
      //获取坐标轴数据
      me._getAxisData();
      //处理x轴
      me._xAxisDeal();
    }

    if (me.fixedPadding) {
      //上边
      if (me.fixedPadding.top !== undefined) {
        //画布边距
        me.svg.style("padding-top", me.fixedPadding.top + "px");
        me.padding.top = me.fixedPadding.top;
      }
      //左边
      if (me.fixedPadding.left !== undefined) {
        //画布边距
        me.svg.style("padding-left", me.fixedPadding.left + "px");
        me.padding.left = me.fixedPadding.left;
      }
      //下边
      if (me.fixedPadding.bottom !== undefined) {
        //画布边距
        me.svg.style("padding-bottom", me.fixedPadding.bottom + "px");
        me.padding.bottom = me.fixedPadding.bottom;
      }
      //右边
      if (me.fixedPadding.right !== undefined) {
        //画布边距
        me.svg.style("padding-right", me.fixedPadding.right + "px");
        me.padding.right = me.fixedPadding.right;
      }
    }
    //初始化图表
    me._chartsInit();

    return this;
  }

  //初始化图表
  _chartsInit() {
    let me = this;
    let forbidCursor = true;
    me.hoverCursorType = "bar";
    //绘制图表
    for (let [index, value] of me.config.entries()) {
      if (value.type === "bar") {
        //绘制柱形图图表
        me._showBarCharts(index, value);
        forbidCursor = false;
      } else if (value.type === "line") {
        me.hoverCursorType = "line";
        //绘制折线图图表
        me._showLineCharts(index, value);
        forbidCursor = false;
      } else if (value.type === "treemaps") {
        //绘制矩形树图图表
        me._showTreemapsCharts(index, value);
        forbidCursor = false;
      } else if (value.type === "scatterPoint") {
        //绘制散点气泡图图表
        me._showScatterPointCharts(index, value);
        forbidCursor = false;
      } else if (value.type === "scatter") {
        //绘制散点图图表
        me._showScatterCharts(index, value);
      } else if (value.type === "map-scatter") {
        //绘制地图散点图图表
        me._showMapScatterCharts(index, value);
      } else if (value.type === "pie") {
        //绘制地图散点图图表
        me._showPieCharts(index, value);
      } else if (value.type === "thread-map") {
        //绘制地图散点图图表
        me._showThreadMap(index, value);
      } else if (value.type === "progress") {
        //绘制地图散点图图表
        me._showProgress(index, value);
        //} else if (value.type == "3d-earth") {
        //  //绘制地图散点图图表
        //  me._show3DEarth(index, value);
      } else if (value.type === "relation") {
        //绘制关系图图表
        me._showRelationMap(index, value);
      }

      //绘制遮罩
      if (value.bottomMask) {

        me.svg.append("rect")
          .attr({
            "class": "bottom-mask",
            height: value.bottomMask + "%",
            x: 0,
            y: 100 - value.bottomMask + "%"
          });
      }
    }

    //初始化标尺
    if (!forbidCursor) {
      let config = me.config;
      //具体数据集
      let xAxis = me.xAxis[config[0].xAxis];
      let dataset = [];
      //图表数据
      let fullData = config[0].data;
      if (fullData.length <= 0) {
        return;
      }
      for (let item of fullData) {
        if (xAxis.type === "value") {
          dataset.push(item.x);
        } else {
          dataset.push(item.y);
        }
      }

      //标尺控制
      me._cursorCtrl(config, dataset);

    }
  }

  /**
   *
   * @description 根据配置更新图表
   * @method update
   * @since 2016年10月12日19:40:24
   * @author jason
   * @example
   *
   *  new BCharts("#eleId")
   *    .setConfig([{
   *      name: "line"
   *    }])
   *    .setXAxis([{
   *      format:function(x){
   *        return x+"K";
   *      }
   *    }])
   *    .update();
   *
   * */
  update() {
    let me = this;

    for (let item of me.config) {
      //数据初始化
      me.xAxis[item.xAxis].data = undefined;
      me.yAxis[item.yAxis].data = undefined;
    }

    //图表容器
    me.build();
  }

  //更新数据
  updateData() {

    let me = this;
    //绘制图表
    for (let [index, value] of me.config.entries()) {
      if (value.type === "bar") {
        //删除柱形图
        let barContainer = me.svg.select(".rect-container_" + index);
        barContainer.remove();
        //绘制柱形图图表
        me._showBarCharts(index, value);
      } else if (value.type === "line") {
        //绘制折线图图表
        me._showLineCharts(index, value);
      } else if (value.type === "treemaps") {
        //绘制矩形树图图表
        me._showTreemapsCharts(index, value);
      } else if (value.type === "scatterPoint") {
        //绘制散点气泡图图表
        me._showScatterPointCharts(index, value);
      } else if (value.type === "scatter") {
        //绘制散点图图表
        me._showScatterCharts(index, value);
      } else if (value.type === "map-scatter") {
        //绘制地图散点图图表
        me._showMapScatterCharts(index, value);
      } else if (value.type === "pie") {
        //绘制地图散点图图表
        me._showPieCharts(index, value);
      } else if (value.type === "thread-map") {
        //绘制地图散点图图表
        me._showThreadMap(index, value);
      } else if (value.type === "progress") {
        //绘制地图散点图图表
        me._showProgress(index, value);
        //} else if (value.type == "3d-earth") {
        //  //绘制地图散点图图表
        //  me._show3DEarth(index, value);
      }
    }
  }

  //绘制画布
  _svgInit() {
    let me = this;
    let element = me.element;
    let chartContainer = d3.select(element);
    //检查元素是否合法
    if (!chartContainer.node()) {
      me._exception(`没有找到${element}元素`);
    }

    //绘制画布前，如果有画布则清空画布容器
    try {
      chartContainer.select(".svg-container").remove();
    } catch (e) {
    }

    //添加SVG画布
    let container = d3.select(element)
      .append("div")
      .attr({
        "class": "svg-container"
      });

    let containerRect = container.node().getBoundingClientRect();
    me.svg = container
      .append("svg")
      .attr({
        "class": "svg-view",
        "height": (me.dataZoom && me.config[me.dataZoom.dataIndex].dataAll.length > 0) ? containerRect.height - 30 : containerRect.height,
        "width": "100%"
      });

    //添加数据区域组件
    if (me.dataZoom && me.config[me.dataZoom.dataIndex].dataAll.length > 0) {

      //数据错误
      if (me.dataZoom.start > me.dataZoom.end) {
        me._exception("数据区域初始化，起始值不能大于结束值");
        return;
      }

      let dataAll = me.config[me.dataZoom.dataIndex].dataAll;

      if (me.dataZoom.end === undefined) {
        //数据格式化
        me.dataZoom.start = parseFloat(me.dataZoom.start);
        //存入当前数据范围
        me.dataZoom.minIndex = Math.trunc(dataAll.length * (me.dataZoom.start / 100));
        if (me.dataZoom.width === undefined) {
          me._exception("dataZoom中end 或 width 其中一个必须有值");
          return;
        }
        if (dataAll.length < me.dataZoom.width) {
          me.dataZoom.width = dataAll.length;
        }
        me.dataZoom.maxIndex = me.dataZoom.minIndex + me.dataZoom.width - 1;
        me.dataZoom.end = me.dataZoom.maxIndex / dataAll.length * 100;
      } else if (me.dataZoom.start === undefined) {
        //数据格式化
        me.dataZoom.end = parseFloat(me.dataZoom.end);
        //存入当前数据范围
        me.dataZoom.maxIndex = Math.trunc(dataAll.length * (me.dataZoom.end / 100));

        if (me.dataZoom.width === undefined) {
          me._exception("dataZoom中start 或 width 其中一个必须有值");
          return;
        }
        if (dataAll.length < me.dataZoom.width) {
          me.dataZoom.width = dataAll.length;
        }
        me.dataZoom.minIndex = me.dataZoom.maxIndex - me.dataZoom.width;
        me.dataZoom.start = me.dataZoom.minIndex / dataAll.length * 100;

      } else {
        //数据格式化
        me.dataZoom.start = parseFloat(me.dataZoom.start);
        me.dataZoom.end = parseFloat(me.dataZoom.end);
        //存入当前数据范围
        me.dataZoom.minIndex = Math.trunc((dataAll.length) * (me.dataZoom.start / 100));
        me.dataZoom.maxIndex = Math.trunc((dataAll.length - 1) * (me.dataZoom.end / 100));
      }

      //添加SVG画布
      me.zoomSvg = d3.select(element)
        .select(".svg-container")
        .append("svg")
        .attr({
          "class": "data-zoom-view",
          "width": "100%",
          "height": "30px"
        });

      for (let item of me.config) {
        let configData = item.dataAll;
        let limitData = [];
        for (let [i, v] of configData.entries()) {
          if (i >= me.dataZoom.minIndex && i <= me.dataZoom.maxIndex) {
            limitData.push(v);
          }
        }
        item.data = limitData;
      }

      me._showDataZoom();

      if (me.dataZoom.bind) {
        let bindConfig = me.dataZoom.bind.config;

        for (let item of bindConfig) {
          let configData = item.dataAll;
          let limitData = [];
          for (let [i, v] of configData.entries()) {
            if (i >= me.dataZoom.minIndex && i <= me.dataZoom.maxIndex) {
              limitData.push(v);
            }
          }
          item.data = limitData;
        }
        //同步更新警告图表
        me.dataZoom.bind.update();
      }
    }

    window.addEventListener("resize", function () {
      if (document.contains(me.svg.node())) {
        let containerRe = d3.select(element).select(".svg-container");
        if (!containerRe.node()) {
          return;
        }
        let containerRectRe = containerRe.node().getBoundingClientRect();
        me.svg.attr({
          "height": (me.dataZoom && me.config[me.dataZoom.dataIndex].dataAll.length > 0) ? containerRectRe.height - 30 : containerRectRe.height
        });
      }
    });
    return {};
  }

  //获取坐标轴数据
  _getAxisData() {
    let me = this;
    let xAxis = me.xAxis;
    let yAxis = me.yAxis;
    for (let config of me.config) {
      let orgData = config.data;
      //图表类型
      let type = config.type;
      if (
        type === "bar"
        || type === "line"
        || type === "scatter"
        || type === "scatterPoint"
      ) {
        let xData = [];
        let yData = [];
        //取当前配置对应的xy轴数据
        if (xAxis[config.xAxis].data) {
          xData = xAxis[config.xAxis].data;
        }
        if (yAxis[config.yAxis].data) {
          yData = yAxis[config.yAxis].data;
        }
        //折线图数据
        for (let item of orgData) {
          //category不叠加
          if (xAxis[config.xAxis].type === "category") {
            if (!xData.includes(item.x)) {
              xData.push(item.x);
            }
          } else {
            //value取最大值和最小值，需要将所有数据添加进去
            xData.push(item.x);
          }
          if (yAxis[config.yAxis].type === "category") {
            if (!yData.includes(item.y)) {
              yData.push(item.y);
            }
          } else {
            yData.push(item.y);
          }
        }
        //设置当前配置对应的xy轴数据
        xAxis[config.xAxis].data = xData;
        yAxis[config.yAxis].data = yData;
      } else if (type === "treemaps") {
        let xData = [];
        //取当前配置对应的x轴数据
        if (xAxis[config.xAxis].data) {
          xData = xAxis[config.xAxis].data;
        }
        //折线图数据
        for (let item of orgData) {
          //category不叠加
          if (xAxis[config.xAxis].type === "category") {
            if (!xData.includes(item.x)) {
              xData.push(item.x);
            }
          } else {
            //value取最大值和最小值，需要将所有数据添加进去
            xData.push(item.x);
          }
        }
        //设置当前配置对应的xy轴数据
        xAxis[config.xAxis].data = xData;
      } else {
        me._exception(`不存在${type}类型的图表`);
      }
    }
    me.xAxis = xAxis;
    me.yAxis = yAxis;
  }

  //绘制坐标轴
  _initAxis() {
    let me = this;
    //处理x轴
    me._xAxisDeal();
    //处理y轴
    me._yAxisDeal();

  }

  //处理x轴
  _xAxisDeal() {
    let me = this;
    let axisConfig = me.xAxis;

    if (axisConfig[0].border) {
      //绘制图表边框
      me.svg.append("line")
        .attr({
          "class": "axis-line" + (axisConfig[0].lineType == "dash" ? " dash" : ""),
          "x1": "0",
          "y1": "0",
          "x2": "100%",
          "y2": "0"
        });
      me.svg.append("line")
        .attr({
          "class": "axis-line" + (axisConfig[0].lineType == "dash" ? " dash" : ""),
          "x1": "0",
          "y1": "100%",
          "x2": "100%",
          "y2": "100%"
        });
    }
    //绘制坐标轴和刻度
    for (let axis of axisConfig) {
      if (axis.position != "top" && axis.position != "bottom") {
        me._exception("x轴位置只能为top和bottom");
      }
      if (axis.data.length <= 0) {
        return;
      }
      //添加x轴数据
      let x = me.svg.append("g")
        .attr("class", "x-axis")
        .selectAll("g")
        .data(axis.data)
        .enter();
      //x轴、刻度与网格
      let scale = me._axisLine(axis, x, "X");
      if (scale) {
        axis.scale = scale;
      }
    }
  }

  //处理Y轴
  _yAxisDeal() {
    let me = this;
    let axisConfig = me.yAxis;
    if (axisConfig[0].border) {
      //绘制图表边框
      me.svg.append("line")
        .attr({
          "class": "axis-line" + (axisConfig[0].lineType == "dash" ? " dash" : ""),
          "x1": "0",
          "y1": "0",
          "x2": "0",
          "y2": "100%"
        });
      me.svg.append("line")
        .attr({
          "class": "axis-line" + (axisConfig[0].lineType == "dash" ? " dash" : ""),
          "x1": "100%",
          "y1": "0",
          "x2": "100%",
          "y2": "100%"
        });
    }
    //绘制坐标轴和刻度
    for (let axis of axisConfig) {
      if (axis.position != "left" && axis.position != "right") {
        me._exception("y轴位置只能为left和right");
      }
      if (axis.data.length <= 0) {
        return;
      }
      //添加y轴数据
      let y = me.svg.append("g")
        .attr("class", "y-axis")
        .selectAll("g")
        .data(axis.data)
        .enter();
      //y轴、刻度与网格
      let scale = me._axisLine(axis, y, "Y");
      if (scale) {
        axis.scale = scale;
      }
    }
  }

  //坐标轴、刻度与网格
  _axisLine(axis, axisGroup, type) {
    let me = this;
    let scale = "";

    if (axis.type == "category") {
      //类别坐标轴
      me._axisCategory(axis, axisGroup, type);
    } else {
      //数值坐标轴
      scale = me._axisValue(axis, axisGroup, type);
    }
    return scale;

  }

  //类坐标轴
  _axisCategory(axis, axisGroup, type) {
    let me = this;
    //一共多少项
    let count = axis.data.length;
    if (!axis.boundaryGap) {
      count--;
    }
    let markPos = 1;
    if (axis.markCount != "") {
      markPos = Math.ceil(count / axis.markCount);
    }
    //比例
    let scale = 100 / count;
    //坐标轴网格
    if (axis.gridLine) {
      //绘制坐标轴网格
      axisGroup.append('line')
        .attr({
          "class": "grid-line" + (axis.lineType == "dash" ? " dash" : ""),
          "x1": (d, i) => {
            //去掉第一条网格
            if (i === 0) {
              return 0;
            }
            if (type == "X") {
              return scale * i + "%";
            }
            return 0;
          },
          "y1": (d, i) => {
            //去掉第一条网格
            if (i === 0) {
              return 0;
            }
            if (type == "X") {
              return 0;
            }
            return (100 - scale * i) + "%";
          },
          "x2": (d, i) => {
            //去掉第一条网格
            if (i === 0) {
              return 0;
            }
            if (type == "X") {
              return scale * i + "%";
            }
            if (i % markPos == 0) {
              return "100%";
            }
            return 0;
          },
          "y2": (d, i) => {
            //去掉第一条网格
            if (i === 0) {
              return 0;
            }
            if (type == "X") {
              if (i % markPos == 0) {
                return "100%";
              }
              return 0;
            }
            return (100 - scale * i) + "%";
          }
        });
    }
    //是否显示坐标轴
    if (axis.show) {
      //坐标轴刻度
      axisGroup.append("foreignObject")
        .attr({
          "width": "120",
          "height": "10",
          "class": () => {
            let className = "";
            if (type == "X") {
              className = "x-axis-text";
              if (axis.textPos == "left") {
                className += " text-left";
              } else if (axis.textPos == "right") {
                className += " text-right";
              }
            } else {
              if (axis.position == "left") {
                className = "y-left-axis-text"
              } else {
                className = "y-right-axis-text"
              }
            }
            return className;
          },
          "x": (d, i) => {
            if (type == "X") {
              let pos = 0;
              if (axis.boundaryGap && axis.textPos == undefined) {
                pos = scale * i + scale / 2;
              } else {
                pos = scale * i;
              }
              if (axis.flip) {
                return 100 - pos + "%";
              }
              return pos + "%";
            }
            if (axis.position == "left") {
              return "0";
            }
            return "100%";
          },
          "y": (d, i) => {
            if (type == "X") {
              if (axis.position == "bottom") {
                return "100%";
              }
              return 0;
            }
            let pos = 0;
            if (axis.boundaryGap) {
              pos = (100 - scale * i - scale / 2);
            } else {
              pos = (100 - scale * i);
            }
            if (axis.flip) {
              return 100 - pos + "%";
            }
            return pos + "%"
          }
        })
        .style({
          "transform": () => {
            if (type == "X") {
              let ypos = "";
              if (axis.position == "bottom") {
                ypos = "5px";
              } else {
                ypos = "-15px";
              }
              if (axis.textPos == "left") {
                return `translate(0, ${ypos})`;
              } else if (axis.textPos == "right") {
                return `translate(-120px, ${ypos})`;
              }
              return `translate(-60px, ${ypos})`;
            }
            if (axis.position == "left") {
              return "translate(-125px, -5px)";
            }
            return "translate(5px, -5px)";
          }
        })
        .html((b, i) => {
          let text = "";
          if (i % markPos == 0) {
            if (axis.format) {
              text = axis.format(b);
            } else {
              text = b;
            }
          }

          return `<div class="text-div" title="${text}">${text}</div>`
        });

      //设置画布边距
      me._setSvgPadding(type, axis);
    }
  }

  //数值坐标轴
  _axisValue(axis, axisGroup, type) {
    let me = this;
    let markCount = axis.markCount;
    let maxValue = axis.maxValue;
    let minValue = axis.minValue;

    if (axis.maxValue === undefined) {
      maxValue = Math.max(...axis.data);
      if (maxValue < 20) {
        if (maxValue > 15) {
          maxValue = 20;
        } else if (maxValue > 10) {
          maxValue = 15;
        } else if (maxValue > 5) {
          maxValue = 10;
        }
      } else {
        let v = maxValue % (markCount - 1);
        maxValue = maxValue + (markCount - 1) - (v === 0 ? (markCount - 1) : v);
      }
    }
    if (axis.minValue === undefined) {
      minValue = 0;
      if (axis.type == "time") {
        minValue = Math.min(...axis.data);
      }
    }
    //坐标轴的比例尺
    let scale = d3.scale.linear()
      .domain([minValue, maxValue]);
    if (axis.flip) {
      scale.range([100, 0])
    } else {
      scale.range([0, 100])
    }
    //绘制坐标轴轴网格
    let axisLine = (type == "X" ? me.svg.select(".x-axis") : me.svg.select(".y-axis"));
    let scaleNum = (maxValue - minValue) / (markCount - 1);
    //坐标轴网格
    if (axis.gridLine) {
      for (let i = 0; i < markCount - 1; i++) {
        if (i === 0) {
          //去掉第一条网格
          continue;
        }
        let scaleNumAfter = i * scaleNum + minValue;
        axisLine.append('line')
          .attr({
            "class": "grid-line" + (axis.lineType == "dash" ? " dash" : ""),
            "x1": () => {
              if (type == "X") {
                return scale(scaleNumAfter) + "%";
              }
              return 0;
            },
            "y1": () => {
              if (type == "X") {
                return 0;
              }
              return scale(scaleNumAfter) + "%";
            },
            "x2": () => {
              if (type == "X") {
                return scale(scaleNumAfter) + "%";
              }
              return "100%";
            },
            "y2": () => {
              if (type == "X") {
                return "100%";
              }
              return scale(scaleNumAfter) + "%";
            }
          });
      }
    }
    //是否显示坐标轴
    if (axis.show) {
      for (let i = 0; i < markCount; i++) {
        let scaleNumAfter = i * scaleNum + minValue;
        axisLine.append('foreignObject')
          .attr({
            "width": "120",
            "height": "10",
            "class": () => {
              if (type == "X") {
                return "x-axis-text";
              }
              if (axis.position == "left" && axis.textPos != "inside") {
                return "y-left-axis-text"
              } else {
                return "y-right-axis-text"
              }
            },
            "x": () => {
              let pos = 0;
              if (type == "X") {
                pos = scale(scaleNumAfter);
              } else {
                if (axis.position == "left") {
                  pos = 0;
                } else {
                  pos = 100;
                }
              }
              return pos + "%";
            },
            "y": () => {
              let pos = 0;
              if (type == "X") {
                if (axis.position == "bottom") {
                  pos = 100;
                } else {
                  pos = 0;
                }
              } else {
                pos = 100 - scale(scaleNumAfter);
              }
              return pos + "%";
            }
          })
          .style({
            "transform": () => {
              if (type == "X") {
                let ypos = "";
                if (axis.position == "bottom") {
                  ypos = "5px";
                } else {
                  ypos = "-15px";
                }
                if (axis.textPos == "left") {
                  return `translate(0, ${ypos})`;
                } else if (axis.textPos == "right") {
                  return `translate(-120px, ${ypos})`;
                }
                return `translate(-60px, ${ypos})`;
              }
              if (axis.position == "left" && axis.textPos != "inside") {
                return "translate(-125px, -5px)";
              }
              return "translate(5px, -5px)";
            }
          })
          .html((b, i) => {

            let text = "";
            if (axis.markType == "all" || i == 0 || i == markCount - 1) {
              let num = parseFloat((scaleNumAfter).toFixed(2));
              if (axis.type != "time") {
                if (scaleNumAfter >= 1000 && scaleNumAfter < 1000000) {
                  num = parseFloat((scaleNumAfter / 1000).toFixed(2)) + "K";
                } else if (scaleNumAfter >= 1000000) {
                  num = parseFloat((scaleNumAfter / 1000000).toFixed(2)) + "M";
                }
              }
              if (axis.format) {
                text = axis.format(num);
              } else {
                text = num;
              }
            }

            return `<div class="text-div" title="${text}">${text}</div>`
          });
        //设置画布边距
        me._setSvgPadding(type, axis);
      }
    }
    return scale;
  }

  //设置画布边距
  _setSvgPadding(type, axis) {
    let me = this;
    //获取文字最大高宽
    let textList = {};
    if (type == "X") {
      textList = me.svg.selectAll(".x-axis .text-div")[0];
    } else {
      textList = me.svg.selectAll(".y-axis .text-div")[0];
    }
    let maxWidth = 0;
    let maxHeight = 0;
    for (let item of textList) {
      let width = item.getBoundingClientRect().width;
      let height = item.getBoundingClientRect().height;
      if (maxWidth < width) {
        maxWidth = width;
      }
      if (maxHeight < height) {
        maxHeight = height;
      }
    }
    if (axis.position == "top") {

      //画布边距
      me.svg.style("padding-top", maxHeight + 10 + "px");
      me.padding.top = maxHeight + 10;
    } else if (axis.position == "left") {

      me.svg.style("padding-left", maxWidth + 10 + "px");
      me.padding.left = maxWidth + 10;
    } else if (axis.position == "bottom") {

      //画布边距
      me.svg.style("padding-bottom", maxHeight + 10 + "px");
      me.padding.bottom = maxHeight + 10;
    } else if (axis.position == "right") {

      //画布边距
      me.svg.style("padding-right", maxWidth + 10 + "px");
      me.padding.right = maxWidth + 10;
    }
  }


  //获取数据区域
  _getBarZoom() {

    let me = this;

    let prop = me.property;

    //数据错误
    if (prop.start > prop.end) {
      me._exception("数据区域初始化，起始值不能大于结束值");
      return;
    }

    let dataAll = me.config[0].dataAll;

    if (prop.end === undefined) {
      //数据格式化
      prop.start = parseFloat(prop.start);
      //存入当前数据范围
      prop.minIndex = Math.trunc(dataAll.length * (prop.start / 100));
      if (prop.width === undefined) {
        me._exception("dataZoom中end 或 width 其中一个必须有值");
        return;
      }
      if (dataAll.length < prop.width) {
        prop.width = dataAll.length;
      }
      prop.maxIndex = prop.minIndex + (prop.width - 1);
      prop.end = prop.maxIndex / dataAll.length * 100;

    } else if (prop.start === undefined) {
      //数据格式化
      prop.end = parseFloat(prop.end);
      //存入当前数据范围
      prop.maxIndex = Math.trunc(dataAll.length * (prop.end / 100));

      if (prop.width === undefined) {
        me._exception("dataZoom中start 或 width 其中一个必须有值");
        return;
      }
      if (dataAll.length < prop.width) {
        prop.width = dataAll.length;
      }
      prop.minIndex = prop.maxIndex - prop.width;
      prop.start = prop.minIndex / dataAll.length * 100;

    } else {
      //数据格式化
      prop.start = parseFloat(prop.start);
      prop.end = parseFloat(prop.end);
      //存入当前数据范围
      prop.minIndex = Math.trunc((dataAll.length - 1) * (prop.start / 100));
      prop.maxIndex = Math.trunc((dataAll.length - 1) * (prop.end / 100));
      //计算宽度
      prop.width = prop.maxIndex - prop.minIndex + 1;
    }

  }

  //拖拽事件
  _onBarZoomDrag(barContainer, wide, dataAll) {

    let me = this;
    let property = me.property;
    return d3.behavior.drag()
      .on("dragstart", function () {

        property.lastminIndex = property.minIndex;
        property.lastmaxIndex = property.maxIndex;

        let xPos = d3.mouse(me.svg.node().parentElement)[0] - me.padding.left;

        if (xPos < 0) {
          xPos = 0;
        }
        let width = me.svg.node().parentElement.getBoundingClientRect().width - me.padding.left - me.padding.right;
        //结束bar位置不能超出控件
        if (xPos / width * 100 > 100) {
          xPos = width;
        }
        property.startTemp = xPos / width * 100;

      })
      .on("drag", function (d) {

        let xPos = d3.mouse(me.svg.node().parentElement)[0] - me.padding.left;

        if (xPos < 0) {
          xPos = 0;
        }
        let width = me.svg.node().parentElement.getBoundingClientRect().width - me.padding.left - me.padding.right;
        //结束bar位置不能超出控件
        if (xPos / width * 100 > 100) {
          xPos = width;
        }
        property.endTemp = xPos / width * 100;

        //判断拖动开始位置和目前位置
        if (property.endTemp >= property.startTemp) {
          property.start = property.startTemp;
          property.end = property.endTemp;
        } else {
          property.start = property.endTemp;
          property.end = property.startTemp;
        }

        let areaWidth = property.end - property.start;

        if (areaWidth) {
          if (areaWidth < wide) {
            areaWidth = wide;
          }
          areaWidth = Math.ceil(areaWidth / wide) * wide;
        }
        property.end = property.start + areaWidth;

        //存入当前数据范围
        property.minIndex = Math.trunc((dataAll.length) * (property.start / 100));
        property.maxIndex = Math.trunc((dataAll.length - 1) * (property.end / 100));

        //调整数据区域
        d3.select(me.element)
          .select(".bar-area")
          .attr({
            "x": property.minIndex * wide + "%",
            "width": areaWidth + "%"
          });

        barContainer
          .selectAll(".data-bar")
          .style({
            "opacity": (d, i) => {
              if (i >= property.minIndex && i <= property.maxIndex) {
                return 1;
              }
              return 0.5;
            }
          });

      }).on("dragend", function () {
        //存入当前数据范围
        if (property.onChange) {
          if (property.lastminIndex != property.minIndex
            || property.lastmaxIndex != property.maxIndex) {
            property.onChange({
              data: dataAll.slice(property.minIndex, property.maxIndex + 1),
              minIndex: property.minIndex,
              maxIndex: property.maxIndex
            });
          }
        }
        //调整数据区域
        d3.select(me.element)
          .select(".bar-area")
          .attr({
            "x": property.minIndex * wide + "%",
            "width": (property.maxIndex - property.minIndex + 1) * wide + "%"
          });

      });
  }


  //绘制柱形图图表
  _showBarCharts(index, config) {
    let me = this;
    let property = me.property;
    //具体数据集
    let xAxis = me.xAxis[config.xAxis];
    let yAxis = me.yAxis[config.yAxis];
    //图表数据
    let fullData = config.data;
    if (fullData.length <= 0) {
      return;
    }
    //柱形图数据
    let dataset = [];
    //具体数据集
    let dataAll = [];
    //重新组装数据
    for (let item of fullData) {

      dataAll.push(Object.assign({}, item, { dataName: config.name }));
      if (xAxis.type == "value") {
        dataset.push(item.x);
      } else {
        dataset.push(item.y);
      }
    }

    //作为数据区域
    if (property.type == "dataZoom") {

      me._getBarZoom();
    }

    let scale = 100 / dataset.length;
    //添加矩形元素
    let barContainer = me.svg.append("g")
      .attr("class", "rect-container_" + index);
    let barCount = 0;
    if (me.config[0].barSplit) {
      barCount = me.config[0].barSplit;
    } else {
      for (let item of me.config) {
        if (item.type == "bar") {
          barCount++;
        }
      }
    }
    //默认柱形为宽度的80%
    let barScale = 0.8;
    if (config.barWidth > 0 && config.barWidth < 1) {
      barScale = config.barWidth;
    }
    //柱形间距
    let barSpace = (1 - barScale) / 2;

    let wide = scale / barCount;
    let barWide = wide * barScale;
    let offset = barWide * index;
    if (barCount <= 1) {
      offset = 0;
    }

    //矩形
    let rects = barContainer.selectAll("rect")
      .data(dataAll)
      .enter()
      .append("rect")
      .style({
        "fill": (d, i) => {
          if (d.color) {
            if (d.color instanceof Array) {
              let def = me.svg.append("linearGradient")
                .attr({
                  id: `rectGradient_${this.element}_${i}`,
                  x1: "0%",
                  y1: "0%",
                  x2: "0%",
                  y2: "100%"
                });
              //起始颜色
              def.append("stop")
                .attr({
                  offset: "0%",
                  style: "stop-color:" + d.color[0]
                });
              //结束颜色
              def.append("stop")
                .attr({
                  offset: "100%",
                  style: "stop-color:" + d.color[1]
                });

              return `url(#rectGradient_${this.element}_${i})`;
            }
            return d.color;
          }
          return config.color ? config.color : "";
        },
        "opacity": (d, i) => {
          if (property.type == "dataZoom") {

            if (property.warningLine <= d.value) {
              barContainer.append("circle")
                .style({
                  fill: "#FF5E76",
                  transform: "translateY(6px)"
                })
                .attr({
                  cx: scale * (i) + 0.5 * scale + "%",
                  cy: "100%",
                  r: 4
                });
            }
            if (i >= property.minIndex && i <= property.maxIndex) {
              return 1;
            }
            return 0.5;
          }
          return 1;
        }
      })
      .attr({
        "class": "data-bar",
        "x": (d, i) => {
          if (xAxis.type == "category") {
            let pos = scale * (i) + barSpace * scale;
            if (xAxis.flip) {
              return 100 - pos - offset + "%";
            }
            return pos + offset + "%";
          }
          if (xAxis.flip) {
            return 100 - xAxis.scale(dataset[i]) + "%";
          }
          return 0;
        },
        "y": (d, i) => {
          let pos = 0;
          if (yAxis.type == "category") {
            pos = 100 - (scale * (i + 1) - barSpace * scale);
            if (yAxis.flip) {
              return 100 - pos - offset + "%";
            }
            return pos + offset + "%";
          }
          pos = 100 - yAxis.scale(dataset[i]);
          if (yAxis.flip) {
            pos = 0;
          }
          return pos + "%"
        },
        "width": (d, i) => {
          if (xAxis.type == "category") {
            return barWide + "%";
          }
          return xAxis.scale(dataset[i]) + "%";
        },
        "height": (d, i) => {
          if (xAxis.type == "category") {
            return Math.abs(yAxis.scale(dataset[i]) - yAxis.scale(0)) + "%";
          }
          return barWide + "%";
        }
      });

    if (config.radius) {
      if (xAxis.type == "category") {
        rects.attr({
          rx: `${barWide / 2}%`
        });
      } else {
        rects.attr({
          ry: `${barWide / 2}%`
        });
      }
    }

    //绘制数据区域
    if (property.type == "dataZoom") {

      let drag = me._onBarZoomDrag(barContainer, wide, dataAll);
      me.svg.call(drag);
      barContainer.append("rect")
        .attr({
          class: "bar-area",
          fill: "#fff",
          opacity: "0.1",
          x: () => scale * property.minIndex + "%",
          y: 0,
          width: wide * property.width + "%",
          height: "100%"
        });
    }
    //柱形无缩放事件
    config.pinch = false;
    //注册事件
    me._eventRegister(rects, config, "");
  }

  //绘制折线图图表
  _showLineCharts(index, config) {
    let me = this;
    let xAxis = me.xAxis[config.xAxis];
    let yAxis = me.yAxis[config.yAxis];
    let fullData = config.data;
    if (fullData.length <= 0) {
      return;
    }
    const timestamp = new Date().getTime();

    //渐变
    if (config.gradient) {
      let gradient = config.gradient;
      //校验配置
      if (!(gradient.color[0] || gradient.color[1])) {
        me._exception("渐变配置错误");
      }
      let def = me.svg.append("linearGradient")
        .attr({
          id: `gradient_${timestamp}`,
          x1: "0%",
          y1: "0%",
          x2: gradient.type === "horizontal" ? "100%" : "0%",
          y2: gradient.type === "horizontal" ? "0%" : "100%"
        });

      //起始颜色
      def.append("stop")
        .attr({
          offset: "0%",
          style: "stop-color:" + gradient.color[0]
        });
      //结束颜色
      def.append("stop")
        .attr({
          offset: "100%",
          style: "stop-color:" + gradient.color[1]
        });

      if (config.lineType === "area") {
        let defArea = me.svg.append("linearGradient")
          .attr({
            id: `gradientArea_${timestamp}`,
            x1: "0%",
            y1: "0%",
            x2: gradient.type === "horizontal" ? "100%" : "0%",
            y2: gradient.type === "horizontal" ? "0%" : "100%"
          });

        //起始颜色
        defArea.append("stop")
          .attr({
            offset: "0%"
          })
          .style({
            "stop-opacity": gradient.type === "horizontal" ? 0.2 : 0.5,
            "stop-color": gradient.color[0]
          });
        //结束颜色
        defArea.append("stop")
          .attr({
            offset: "100%"
          })
          .style({
            "stop-opacity": gradient.type === "horizontal" ? 0.2 : 0.1,
            "stop-color": gradient.color[1]
          });
      }
    }
    //曲线图数据
    let dataset = [];
    //具体数据集
    let dataAll = [];
    //重新组装数据
    for (let item of fullData) {
      dataAll.push({
        x: item.x,
        y: item.y,
        dataName: config.name
      });
      if (xAxis.type === "value") {
        dataset.push(item.x);
      } else {
        dataset.push(item.y);
      }
    }

    //曲线生成器
    let lineFunction = d3.svg.line()
      .x((d, i) => me._lineChartGetX(xAxis, dataset, i))
      .y((d, i) => me._lineChartGetY(yAxis, dataset, i))
      .interpolate(config.interpolate);
    let areaFunction;
    if (config.lineType === "area") {
      //曲线区域生成器
      areaFunction = d3.svg.area()
        .x((d, i) => me._lineChartGetX(xAxis, dataset, i))
        .y0(() => {
          return me.svg.node().getBoundingClientRect().height - (me.padding.bottom + me.padding.top);
        })
        .y1((d, i) => me._lineChartGetY(yAxis, dataset, i))
        .interpolate(config.interpolate);
    }

    let dataColor = config.color ? config.color : "";
    //把path扔到容器中，并给d赋属性
    let lineContainer = me.svg.append("g").attr("class", "line-container_" + index);
    //绘制区域
    if (areaFunction) {
      let area = lineContainer.append("path")
        .style({
          "fill": config.gradient ? `url(#gradientArea_${timestamp})` : dataColor,
          "opacity": config.gradient ? "" : 0.2
        })
        .attr({
          "class": "data-area area_" + index,
          "d": areaFunction(dataset)
        });
    }
    //图表高度
    let linChartHeight = lineContainer.node().getBoundingClientRect().height;
    lineContainer.append("path")
      .style({
        "stroke": config.gradient ? `url(#gradient_${timestamp})` : dataColor,
        "stroke-width": config.lineWidth !== undefined ? config.lineWidth : ""
      })
      .attr({
        "class": "data-line line_" + index,
        //让折线高度充满图表
        "d": lineFunction(dataset) + `M0,${linChartHeight}`
      });
    //是否显示圆点
    if (config.showPoint) {
      let point = lineContainer.selectAll('circle')
        .data(dataAll)
        .enter()
        .append('circle')
        .style({
          "stroke": dataColor
        })
        .attr({
          "class": "line-circle",
          "r": 2.5,
          "cx": (d, i) => me._lineChartGetX(xAxis, dataset, i),
          "cy": (d, i) => me._lineChartGetY(yAxis, dataset, i)
        });
      //默认添加动画
      config.pinch = config.pinch === undefined ? true : config.pinch;
      //注册事件
      me._eventRegister(point, config, "circle");
    }
    if (config.showTopInfo) {

      let maxItem = {};
      for (let [ind, item] of dataAll.entries()) {
        if (!(maxItem.y >= item.y)) {
          maxItem = item;
          maxItem.maxIndex = ind;
        }
      }
      let topInfoContainer = lineContainer.append("g").datum(maxItem).attr({ "class": "top-info" });

      let cx = me._lineChartGetX(xAxis, dataset, maxItem.maxIndex);
      let cy = me._lineChartGetY(yAxis, dataset, maxItem.maxIndex);

      topInfoContainer
        .append('circle')
        .attr({
          "class": "top-opacity",
          "r": 8,
          cx,
          cy
        });
      topInfoContainer
        .append('circle')
        .attr({
          "class": "top-point",
          "r": 4,
          cx,
          cy
        });
      topInfoContainer
        .append('path')
        .attr({
          "class": "top-arrow-left",
          "d": `M${cx + 12} ${cy} L${cx + 18} ${cy - 5} L${cx + 18} ${cy + 5}  Z`
        });
      topInfoContainer
        .append('path')
        .attr({
          "class": "top-arrow-right",
          "d": `M${cx + 12 + 118} ${cy - 5} L${cx + 18 + 118} ${cy} L${cx + 12 + 118} ${cy + 5}  Z`
        });
      topInfoContainer
        .append('rect')
        .attr({
          "class": "top-rect",
          "width": 118,
          "height": 42,
          "rx": 2,
          "ry": 2,
          "x": cx + 18,
          "y": cy - 21
        });
      let textContainer = topInfoContainer.append("g");
      textContainer
        .append('text')
        .attr({
          "class": "top-text-y",
          "x": cx + 26,
          "y": cy - 5
        })
        .text(config.topInfo(maxItem)[0]);
      textContainer
        .append('text')
        .attr({
          "class": "top-text-x",
          "x": cx + 26,
          "y": cy + 14
        })
        .text(config.topInfo(maxItem)[1]);

      let topInfoPos = topInfoContainer.node().getBoundingClientRect();
      let svgContainerPos = d3.selectAll(me.element).select(".svg-container").node().getBoundingClientRect();

      //超出图表则翻转
      topInfoContainer.classed({
        "top-info-flip": topInfoPos.left + topInfoPos.width > svgContainerPos.left + svgContainerPos.width
      });

    }
    //窗口变化时重绘曲线
    window.addEventListener("resize", function () {
      if (document.contains(me.svg.node())) {
        me.svg.select(".data-line.line_" + index).attr("d", `${lineFunction(dataset)} M0,${linChartHeight}`);
        if (areaFunction) {
          me.svg.select(".data-area.area_" + index).attr("d", `${areaFunction(dataset)} M0,${linChartHeight}`);
        }
        if (config.showPoint) {
          lineContainer.selectAll('circle')
            .attr({
              "cx": (d, i) => me._lineChartGetX(xAxis, dataset, i),
              "cy": (d, i) => me._lineChartGetY(yAxis, dataset, i)
            });
        }
        if (config.showTopInfo) {
          let topInfoContainer = lineContainer.select(".top-info");
          //重置
          topInfoContainer.classed({
            "top-info-flip": false
          });
          let maxItem = topInfoContainer.datum();
          let cx = me._lineChartGetX(xAxis, dataset, maxItem.maxIndex);
          let cy = me._lineChartGetY(yAxis, dataset, maxItem.maxIndex);

          topInfoContainer.selectAll("circle")
            .attr({
              cx,
              cy
            });
          topInfoContainer.select(".top-arrow")
            .attr({
              d: `M${cx + 12} ${cy} L${cx + 18} ${cy - 5} L${cx + 18} ${cy + 5}  Z`
            });
          topInfoContainer.select(".top-rect")
            .attr({
              "width": 118,
              "height": 42,
              "rx": 2,
              "ry": 2,
              "x": cx + 18,
              "y": cy - 21
            });
          topInfoContainer.select(".top-text-y")
            .attr({
              "x": cx + 26,
              "y": cy - 5
            });
          topInfoContainer.select(".top-text-x")
            .attr({
              "x": cx + 26,
              "y": cy + 14
            });
          let topInfoPos = topInfoContainer.node().getBoundingClientRect();
          let svgContainerPos = d3.selectAll(me.element).select(".svg-container").node().getBoundingClientRect();
          //超出图表则翻转
          topInfoContainer.classed({
            "top-info-flip": topInfoPos.left + topInfoPos.width > svgContainerPos.left + svgContainerPos.width
          });
        }
      }
    });
  }

  //获取x数值
  _lineChartGetX(xAxis, dataset, i) {
    let me = this;
    //获取画布容器宽度
    let width = me.svg.node().getBoundingClientRect().width - (me.padding.left + me.padding.right);
    if (xAxis.scale) {
      return width * (xAxis.scale(dataset[i]) / 100);
    }
    let count = dataset.length;
    if (!xAxis.boundaryGap) {
      count--;
    }
    let scale = 100 / count;
    let pos = 0;
    if (xAxis.boundaryGap) {
      pos = width * (scale * i / 100 + scale / 100 / 2);
    } else {
      pos = width * scale * i / 100;
    }
    if (xAxis.flip) {
      pos = width - pos;
    }
    return pos;
  }

  //获取y数值
  _lineChartGetY(yAxis, dataset, i) {
    let me = this;
    //获取画布容器宽度
    let height = me.svg.node().getBoundingClientRect().height - (me.padding.top + me.padding.bottom);
    if (yAxis.scale) {
      return height * (1 - yAxis.scale(dataset[i]) / 100);
    }
    let count = dataset.length;
    if (!yAxis.boundaryGap) {
      count--;
    }
    let scale = 100 / count;
    let pos = 0;
    if (yAxis.boundaryGap) {
      pos = height * (1 - scale * i / 100 - scale / 100 / 2);
    } else {
      pos = height * scale * i / 100;
    }
    if (yAxis.flip) {
      pos = height - pos;
    }
    return pos;
  }


  //定义渐变效果
  _gradientDefine(colorList) {

    let me = this;
    let def = me.svg
      .append("defs");

    for (let [i, color] of colorList.entries()) {

      let gradient = def.append("radialGradient")
        .attr({
          cx: "50%",
          cy: "50%",
          fx: "50%",
          fy: "50%",
          r: "50%",
          id: "gradient_" + i
        });
      gradient.append("stop")
        .attr({
          offset: "0",
          "stop-opacity": 0.6,
          "stop-color": color
        });
      gradient.append("stop")
        .attr({
          offset: "1",
          "stop-opacity": 0,
          "stop-color": color
        });
    }
  }

  _showTreemapsCharts(index, config) {
    let me = this;

    //图表数据
    let fullData = config.data;
    if (!fullData || Object.keys(fullData).length <= 0) {
      return;
    }
    //获取画布容器宽度
    const width = me.svg.node().getBoundingClientRect().width - (me.padding.left + me.padding.right);
    const itemWidth = width / fullData.length;
    //获取画布容器高度
    const height = me.svg.node().getBoundingClientRect().height - (me.padding.top + me.padding.bottom);
    //图表图数据
    // let dataset = [];
    //具体数据集
    // let dataAll = [];
    me._setTreeMapRect(itemWidth, height, fullData, config);

    //窗口变化时重绘曲线
    window.addEventListener("resize", function () {
      if (document.contains(me.svg.node())) {
        //获取画布容器宽度
        const widthResize = me.svg.node().getBoundingClientRect().width - (me.padding.left + me.padding.right);
        const itemResizeWidth = widthResize / fullData.length;
        //重新组装数据
        for (let [index, item] of fullData.entries()) {
          const groupReset = me.svg
            .select(`.treemap-item-${index}`);

          const treemapReset = d3.layout.treemap()
            .size([itemResizeWidth * 0.8, height])
            .value(d => d.value);

          const nodesReset = treemapReset.nodes({
            name: 'parent',
            children: item.y
          }).filter(d => !d.children);

          groupReset
            .data(nodesReset)
            .selectAll("rect")
            .attr("class", "nodeRect")
            .attr("x", d => (d.x + (itemResizeWidth * (index + 0.1))))
            .attr("y", d => d.y)
            .attr("width", d => d.dx)
            .attr("height", d => d.dy)
            .style("fill", (d, i) => config.color[i]);
        }
      }
    });
  }

  _setTreeMapRect(itemWidth, height, fullData, config) {
    const me = this;
    //重新组装数据
    for (let [index, item] of fullData.entries()) {
      const group = me.svg
        .append("g")
        .attr({
          'class': `treemap-item-${index}`
        });

      const treemap = d3.layout.treemap()
        .size([itemWidth * 0.8, height])
        .value(d => d.value);

      const nodes = treemap.nodes({
        name: 'parent',
        children: item.y
      }).filter(d => !d.children);

      group
        .selectAll('rect')
        .data(nodes)
        .enter()
        .append("rect")
        .attr("class", "nodeRect")
        .attr("x", d => (d.x + (itemWidth * (index + 0.1))))
        .attr("y", d => d.y)
        .attr("width", d => d.dx)
        .attr("height", d => d.dy)
        .style("fill", (d, i) => config.color[i]);
    }
  }

  //显示散点气泡图
  _showScatterPointCharts(index, config) {

    let me = this;

    //图表数据
    let fullData = config.data;
    if (!fullData || Object.keys(fullData).length <= 0) {
      return;
    }
    //Y轴坐标数据
    let yAxisData = me.yAxis[0].data;
    //x轴坐标数据
    let xAxisData = me.xAxis[0].data;
    //散点数据
    let pointData = [];
    let maxValue = 0;

    for (let item of fullData) {
      if (item.value > maxValue) {
        maxValue = item.value;
      }
      pointData.push(Object.assign({}, {
        name: config.name,
        xIndex: xAxisData.indexOf(item.x),
        yIndex: yAxisData.indexOf(item.y)
      }, item));
    }

    //散点图大小
    let pointSize = config.pointSize === undefined ? 5 : config.pointSize;
    let maxPointSize = config.maxPointSize === undefined ? 5 : config.maxPointSize;
    let minPointSize = config.minPointSize === undefined ? 5 : config.minPointSize;

    //数据容器
    let point = me.svg.append("g")
      .attr("class", "scatter-point-container_" + index)
      .selectAll(".scatter-point-container" + index)
      .data(pointData)
      .enter();

    let inner = point.append('circle')
      .style({
        fill: config.color ? config.color : "#22C3F7"
      })
      .attr({
        "class": "data-scatter-point",
        "cx": d => {
          if (me.xAxis[0].type === "category") {
            //一共多少项
            let count = xAxisData.length;
            //缩放
            let scale = 100 / count;
            return d.xIndex * scale + 0.5 * scale + "%";
          }
          return me.xAxis[0].scale(d.x) + "%";
        },
        "cy": d => {
          if (me.yAxis[0].type === "category") {
            //一共多少项
            let count = yAxisData.length;
            //缩放
            let scale = 100 / count;
            return (100 - d.yIndex * scale - 0.5 * scale) + "%";
          }
          return (100 - me.yAxis[0].scale(d.y)) + "%";
        },
        "r": d => {
          let pointR = pointSize;
          if (maxPointSize !== minPointSize && maxValue) {
            pointR = (d.value / maxValue) * (maxPointSize - minPointSize);

            pointR += minPointSize;
            if (d.value === 0) {
              pointR = 0;
            }
          } else if (maxValue === 0) {
            pointR = 0;
          }
          return pointR;
        }
      });

    //默认添加动画
    config.pinch = config.pinch === undefined ? true : config.pinch;
    //注册事件
    me._eventRegister(inner, config, "circle");
  }

  //显示散点图
  _showScatterCharts(index, config) {

    let me = this;

    //图表数据
    let fullData = config.data;
    if (!fullData || Object.keys(fullData).length <= 0) {
      return;
    }
    //Y轴坐标数据
    let yAxisData = me.yAxis[0].data;
    //x轴坐标数据
    let xAxisData = me.xAxis[0].data;
    //散点数据
    let pointData = [];

    let defaultColor = config.color ? config.color : "#22C3F7";
    let colorList = [defaultColor];
    for (let item of me.scatterThreshold) {
      colorList.push(item.color);
    }
    me._gradientDefine(colorList);

    for (let item of fullData) {
      pointData.push(Object.assign({}, {
        name: config.name,
        xIndex: xAxisData.indexOf(item.x),
        yIndex: yAxisData.indexOf(item.y)
      }, item));
    }

    //散点图大小
    let pointSize = config.pointSize === undefined ? 6 : config.pointSize;

    //数据容器
    let point = me.svg.append("g")
      .attr("class", "scatter-container_" + index)
      .selectAll(".scatter-container" + index)
      .data(pointData)
      .enter();
    point.append('circle')
      .style({
        fill: (d, i) => {
          if (me.scatterThreshold) {
            for (let [index, item] of me.scatterThreshold.entries()) {
              let range = item.range;
              let min = range[0];
              let max = range[1];
              if ((min === "" || d.value >= min) && (max === "" || d.value <= max)) {

                return `url(#gradient_${index + 1})`;
              }
            }
          }
          return "url(#gradient_0)";
        }
      })
      .attr({
        "class": "data-scatter glass",
        "cx": d => {
          if (me.xAxis[0].type === "category") {
            //一共多少项
            let count = xAxisData.length;
            //缩放
            let scale = 100 / count;
            return d.xIndex * scale + 0.5 * scale + "%";
          }
          return me.xAxis[0].scale(d.x) + "%";

        },
        "cy": d => {
          if (me.yAxis[0].type === "category") {
            //一共多少项
            let count = yAxisData.length;
            //缩放
            let scale = 100 / count;
            return (100 - d.yIndex * scale - 0.5 * scale) + "%";
          }
          return (100 - me.yAxis[0].scale(d.y)) + "%";
        },
        "r": pointSize
      });

    let inner = point.append('circle')
      .style({
        fill: (d, i) => {
          if (me.scatterThreshold) {
            for (let [index, item] of me.scatterThreshold.entries()) {
              let range = item.range;
              let min = range[0];
              let max = range[1];
              if ((min === "" || d.value >= min) && (max === "" || d.value <= max)) {

                return item.color;
              }
            }
          }
          return config.color ? config.color : "";
        }
      })
      .attr({
        "class": "data-scatter",
        "cx": d => {
          if (me.xAxis[0].type === "category") {
            //一共多少项
            let count = xAxisData.length;
            //缩放
            let scale = 100 / count;
            return d.xIndex * scale + 0.5 * scale + "%";
          }
          return me.xAxis[0].scale(d.x) + "%";

        },
        "cy": d => {
          //一共多少项
          let count = yAxisData.length;
          //缩放
          let scale = 100 / count;
          return (100 - d.yIndex * scale - 0.5 * scale) + "%";
        },
        "r": 2
      });

    //默认添加动画
    config.pinch = config.pinch === undefined ? true : config.pinch;
    //注册事件
    me._eventRegister(inner, config, "circle");

  }

  //选中散点
  setPointSelected(param) {

    this.svg.selectAll(".data-scatter")
      .attr({
        selected: (d) => d.x === param.x && d.y === param.y,
        r: function (d) {

          let r = 2;
          if (this.classList.contains("glass")) {
            r = 6;
          }

          if (d.x === param.x && d.y === param.y) {
            return r * 3;
          }
          return r;
        }
      });

  }

  //绘制地图
  _drawMap(config, callBack) {

    let me = this;
    //画布边距
    me.svg.style("padding", 0);
    let height = me.svg.node().getBoundingClientRect().height;
    let width = me.svg.node().getBoundingClientRect().width;
    let map = me.svg.append("g")
      .attr("class", "map-container");

    d3.json(me.resourcePath + me.geoJson, function (error, root) {
      if (error) {
        me._exception(error);
        return;
      }

      //1、地理投影
      let projection = d3.geo.mercator();
      //2、地理路径生成器
      let path = d3.geo.path()
        .projection(projection);

      let bounds = path.bounds(root);

      let hScale = height / (bounds[1][1] - bounds[0][1]);
      let wScale = width / (bounds[1][0] - bounds[0][0]);
      //设置投影中心、缩放比例、位移
      projection.center(d3.geo.centroid(root))
        .scale((hScale < wScale ? hScale : wScale) * 140)
        .translate([width / 2, height / 2]);

      //存入图表对象
      me.projection = projection;

      d3.json(me.resourcePath + "map-json/world_605kb.json", function (error, root2) {

        if (error) {
          me._exception(error);
          return;
        }

        let zoom = {};
        if (config.zoom) {
          //缩放背景
          zoom = me._zoomEvent(path, config, projection);
          //注册缩放事件
          map.append("rect")
            .attr({
              "class": "map-bg",
              "x": 0,
              "y": 0
            })
            .call(zoom);
        }

        let mapBg = map.append("g").selectAll("path")
          .data(root2.features)
          .enter()
          .append("path")
          .attr("class", "map-background")
          .attr("d", path);

        let mainMap = map.append("g").selectAll("path")
          .data(root.features)
          .enter()
          .append("path")
          .attr("class", "main-map")
          .attr("d", path);

        //注册缩放事件
        if (config.zoom) {
          mapBg.call(zoom);
          mainMap.call(zoom);
        }
        if (callBack) {
          //回调函数
          callBack(projection);
        }
      });
    });
  }

  //地图散点图图表
  _showMapScatterCharts(index, config) {

    let me = this;

    //绘制地图
    me._drawMap(config, (projection) => {
      //绘制散点
      me._mapPointDeal(config, projection);
    });
  }

  //绘制修改地图散点
  _mapPointDeal(config, projection) {
    let me = this;
    let data = config.data;
    let maxValue = 0;
    //获取散点最大值，用于制作比例尺
    for (let value of data) {
      if (value[2] > maxValue) {
        maxValue = value[2];
      }
    }
    //散点图大小比例尺
    let pointSize = config.pointSize === undefined ? 10 : config.pointSize;
    let pointScale = d3.scale.linear()
      .domain([0, maxValue])
      .range([0, pointSize]);
    let mapPoint = me.svg.selectAll(".map-point");
    //判断是否已绘制散点数据
    if (mapPoint[0].length > 0) {
      //修改散点位置
      let solidPoint = mapPoint.selectAll(".solid-point");
      solidPoint
        .attr("cx", (d) => {
          let proPeking = projection([d.lng, d.lat]);
          return proPeking[0];
        })
        .attr("cy", (d) => {
          let proPeking = projection([d.lng, d.lat]);
          return proPeking[1];
        });
      //同步修改动画位置
      let hollowCircle = mapPoint.selectAll(".hollow-circle");
      hollowCircle
        .attr("cx", (d, i) => {
          let proPeking = projection([d.lng, d.lat]);
          return proPeking[0];
        })
        .attr("cy", (d, i) => {
          let proPeking = projection([d.lng, d.lat]);
          return proPeking[1];
        });
    } else {
      let circleContainer = me.svg.append("g").attr("class", "map-point");
      //阈值
      let safeLine = undefined;
      if (me.mapThreshold) {
        if (me.mapThreshold.type == "range") {
          //排名类型则计算出前几的最小数值作为阈值
          let range = [];
          //取最大的N个数字
          for (let value of data) {
            let curValue = value[2];
            if (range.length < me.mapThreshold.value) {
              range.push(curValue);
              continue;
            }
            let rangeMin = Math.min(...range);
            if (rangeMin < curValue) {
              let i = range.findIndex((value) => {
                return value == rangeMin;
              });
              range.splice(i);
              range.push(curValue);
            }
          }
          safeLine = Math.min(...range);
        } else {
          safeLine = me.mapThreshold.value;
        }
      }

      //如果有安全值则显示动画
      if (me.mapThreshold.animation && safeLine !== undefined) {
        //绘制动画
        for (let value of data) {

          let proPeking = projection([value[0], value[1]]);
          if (value[2] >= safeLine) {
            me._createCircleAnimate(circleContainer, proPeking, pointScale, value);
          }
        }
      }
      //初次绘制散点数据
      for (let value of data) {
        let proPeking = projection([value[0], value[1]]);
        //绘制数据圆点
        circleContainer.append("circle")
          .datum({
            lng: value[0],
            lat: value[1],
            value: value[2],
            orgData: value
          })
          .style({
            "fill": (d) => d.value >= safeLine ? me.mapThreshold.color : ""
          })
          .attr({
            "class": "solid-point",
            "cx": proPeking[0],
            "cy": proPeking[1],
            "r": () => {
              if (pointScale(value[2]) > 0 && pointScale(value[2]) < 1) {
                return 1;
              }
              return pointScale(value[2]);
            }
          });
      }
      //默认添加动画
      config.pinch = config.pinch === undefined ? true : config.pinch;
      let point = circleContainer.selectAll(".solid-point");
      if (point.length > 0 && point[0].length > 0) {
        //注册事件
        me._eventRegister(point, config, "circle");
      }
    }
  }

  //导弹图
  _showThreadMap(index, config) {

    let me = this;
    //绘制地图
    me._drawMap(config);

    //绘制标注位置
    let legendContainer = me.svg.append("g");
    let y = 0;
    //发起攻击标注
    for (let key in config.legend) {
      y += 20;
      me._getThreadRect(10, y, config.legend[key].color);
      legendContainer.append("text")
        .attr({
          x: 25,
          y: y + 5,
          "font-size": "12px",
          fill: "#8691AD"
        })
        .text(config.legend[key].text);
    }
    //未拦截标注
    y += 20;
    me._warningCircle(10, y);
    legendContainer.append("text")
      .attr({
        x: 25,
        y: y + 5,
        "font-size": "12px",
        fill: "#8691AD"
      })
      .text("被攻击地");
    //已拦截标注
    y += 20;
    me._getHexagonal(10, y);
    legendContainer.append("text")
      .attr({
        x: 25,
        y: y + 5,
        "font-size": "12px",
        fill: "#8691AD"
      })
      .text("已拦截");
  }

  //导弹图绘制路线
  fire(data) {
    let me = this;
    //绘制路线
    for (let [index, value] of data.entries()) {

      let lineContainer = me.svg.append("g").attr("class", "map-line");

      //转化为数组
      let from = me.projection([value.from[0], value.from[1]]);
      let to = me.projection([value.to[0], value.to[1]]);

      let time = new Date().getTime();

      //重置发起攻击坐标
      if ((value.from[0] == value.to[0] && value.from[1] == value.to[1])//本市
        //未搜到省市默认定为[0, 0]
        || (value.from[0] == 0 && value.from[1] == 0)) {

        let svgRect = me.svg.node().getBoundingClientRect();
        let x = svgRect.width - 30;
        let y = 40;
        //计算纵坐标
        if (me.threatCity.length == 0) {
          me.threatCity[0] = value.fromText;
        } else {
          let count = 0;
          for (let [i, item] of me.threatCity.entries()) {
            count++;
            if (!item) {
              me.threatCity[i] = value.fromText;
              break;
            }
            y += 20;
          }
          //循环完整，则添加元素
          if (count == me.threatCity.length) {
            me.threatCity[count] = value.fromText;
          }
        }
        from = [x, y];
      }
      let r = Math.sqrt(Math.abs(to[0] - from[0]) * Math.abs(to[0] - from[0]) + Math.abs(to[1] - from[1]) * Math.abs(to[1] - from[1]));
      //攻击路线
      let path = `M${from[0]} ${from[1]}A${r * 1.5} ${r * 1.5} 0 0 1 ${to[0]} ${to[1]}`;
      //绘制起点和终点
      me._setTerminal(from, to, index, time, value);

      //绘制线路
      let p = lineContainer.append("path")
        .style({
          "stroke": "url(#mapLineGradient" + index + time + ")",
          //"stroke": "#22C3F7",
          //"stroke-width": "3",
          "display": "none",
          "fill": "none"
        })
        .attr({
          "d": path
        });
      p.style({
        "display": "",
        "stroke-dasharray": "0," + p.node().getTotalLength(),
        "stroke-dashoffset": 0,
        "stroke-width": "2",
        "transition": "all 1200ms ease"
      });

      //渐变
      me._setMapGradient(from, to, index, time, p, me.config[0].legend[value.threatType].color);
      let textContainer = me.svg.append("g")
        .attr({
          "class": "thread-text-container"
        })
        .style({
          opacity: 1,
          transition: "all 1200ms ease"
        });
      //发起攻击城市
      textContainer.append("text")
        .attr({
          x: from[0] > to[0] ? from[0] + 10 : from[0] - 10,
          y: from[1] + 5,
          "text-anchor": from[0] > to[0] ? "start" : "end"
        })
        .text(value.fromText);
      //发起攻击城市
      textContainer.append("text")
        .attr({
          x: from[0] > to[0] ? to[0] - 10 : to[0] + 10,
          y: to[1] + 5,
          "text-anchor": from[0] > to[0] ? "end" : "start"
        })
        .text(value.toText);
      //制作动画
      p.style({
        "stroke-dasharray": p.node().getTotalLength() + "," + p.node().getTotalLength(),
        "stroke-width": "3"
      });
      setTimeout(() => {
        p.style({
          "stroke-dashoffset": 0 - p.node().getTotalLength(),
          "stroke-width": "2"
        });
        textContainer.style({
          opacity: 0
        });
        setTimeout(() => {
          lineContainer.remove();
          textContainer.remove();
          let cityIndex = me.threatCity.indexOf(value.fromText);
          if (cityIndex >= 0) {
            me.threatCity[cityIndex] = undefined;
          }
          d3.select("#mapLineGradient" + index + time).remove();
        }, 1200);
      }, 500);
    }
  }

  //设置导弹图渐变
  _setMapGradient(from, to, index, time, p, color) {

    let me = this;

    let svgRect = me.svg.node().getBoundingClientRect();
    let pRect = p.node().getBoundingClientRect();

    let top = pRect.top - svgRect.top;
    let left = pRect.left - svgRect.left;
    let width = pRect.width;
    let height = pRect.height;

    let def = me.svg.append("linearGradient")
      .attr({
        id: "mapLineGradient" + index + time,
        x1: Math.round(from[0] - left) / width * 100 + "%",
        y1: Math.round(from[1] - top) / height * 100 + "%",
        x2: Math.round(to[0] - left) / width * 100 + "%",
        y2: Math.round(to[1] - top) / height * 100 + "%"
      });

    //0%
    def.append("stop")
      .attr({
        offset: "0",
        "stop-opacity": 0,
        "stop-color": color
      });
    //50%
    def.append("stop")
      .attr({
        offset: "0.5",
        "stop-opacity": 1,
        "stop-color": color
      });
    //100%
    def.append("stop")
      .attr({
        offset: "1",
        "stop-opacity": 0,
        "stop-color": color
      });
  }

  //绘制起点和终点
  _setTerminal(from, to, index, time, item) {

    let me = this;

    //绘制起点
    me._setFromTerminal(from, item);

    //绘制终点
    me._setToTerminal(to, item);
  }

  //绘制起点
  _setFromTerminal(from, item) {

    let me = this;

    //矩形边框
    let fromTerminal = me._getThreadRect(from[0], from[1], me.config[0].legend[item.threatType].color);

    //渐变透明，然后销毁
    setTimeout(() => {
      fromTerminal.style({
        opacity: 0
      });
      setTimeout(() => {
        fromTerminal.remove();
      }, 500);
    }, 1000);
  }

  //绘制矩形
  _getThreadRect(x, y, color) {

    let me = this;

    let threadRect = me.svg.append("g")
      .style({
        opacity: 1,
        "transition": "opacity 500ms ease"
      });

    //矩形边框
    threadRect.append("rect")
      .attr({
        x: x - 5,
        y: y - 5,
        width: 10,
        height: 10,
        fill: "none",
        stroke: color
      });
    //六边形内部
    threadRect.append("rect")
      .attr({
        x: x - 3.5,
        y: y - 3.5,
        width: 7,
        height: 7,
        fill: color,
        stroke: "none"
      });
    return threadRect;
  }

  //绘制终点
  _setToTerminal(to, item) {

    let me = this;
    let toTerminal;
    let toTerminalCircle;
    //被拦截
    if (item.intercept) {

      //绘制六边形
      toTerminal = this._getHexagonal(to[0], to[1]);
    } else {
      //绘制圆点
      toTerminalCircle = this._warningCircle(to[0], to[1]);
    }
    //扩散
    setTimeout(() => {
      if (toTerminalCircle) {
        toTerminalCircle[1].style({
          r: 10
        });
      }
    }, 200);
    //渐变透明，然后销毁
    setTimeout(() => {
      if (toTerminal) {
        toTerminal.style({
          opacity: 0
        });
      } else {
        toTerminalCircle[0].style({
          opacity: 0
        });
      }
      setTimeout(() => {
        if (toTerminal) {
          toTerminal.remove();
        } else {
          toTerminalCircle[0].remove();
        }
      }, 500);
    }, 1000);
  }

  //未拦截
  _warningCircle(x, y) {

    let me = this;
    let warningCircle = me.svg.append("g")
      .style({
        opacity: 1,
        "transition": "all 1000ms ease"
      });
    //未拦截
    warningCircle.append("circle")
      .attr({
        "cx": x,
        "cy": y,
        "r": 4,
        fill: "#F97869"
      });
    //未拦截
    let circle = warningCircle.append("circle")
      .attr({
        "cx": x,
        "cy": y,
        "r": 4,
        fill: "#F97869"
      })
      .style({
        opacity: 0.4,
        "transition": "all 1000ms ease"
      });

    return [warningCircle, circle];
  }

  //绘制六边形
  _getHexagonal(x, y) {

    let me = this;
    //获取外围六边形坐标
    let polygonOut = me._getHexagonalPoints([x, y], 0);
    let polygonIn = me._getHexagonalPoints([x, y], 1.5);
    let hexagonal = me.svg.append("g")
      .style({
        opacity: 1,
        "transition": "opacity 1000ms ease"
      });
    //六边形边框
    hexagonal.append("polygon")
      .attr({
        points: polygonOut.join(" "),
        fill: "none",
        stroke: "#22C3F7"
      });
    //六边形内部
    hexagonal.append("polygon")
      .attr({
        points: polygonIn.join(" "),
        fill: "#22C3F7",
        stroke: "none"
      });

    return hexagonal;
  }

  //获取六边形坐标
  _getHexagonalPoints(center, size) {

    let points = [];
    //顶点开始，顺时针计算坐标
    points[0] = center[0] + "," + (center[1] - (6 - size));
    points[1] = (center[0] + 5 - size) + "," + (center[1] - (3 - size));
    points[2] = (center[0] + 5 - size) + "," + (center[1] + (3 - size));
    points[3] = center[0] + "," + (center[1] + (6 - size));
    points[4] = (center[0] - 5 + size) + "," + (center[1] + (3 - size));
    points[5] = (center[0] - 5 + size) + "," + (center[1] - (3 - size));

    return points;
  }

  //环形图组件
  _showProgress(index, config) {

    let me = this;
    let svgContainer = d3.selectAll(this.element).select(".svg-container");
    setTimeout(() => {
      svgContainer.style("overflow", "visible");
    }, 0);
    //画布边距
    me.svg.style("padding", 0);

    let height = me.svg.node().getBoundingClientRect().height;
    let width = me.svg.node().getBoundingClientRect().width;

    let diameter = width;
    //获取直径
    if (height < width) {
      diameter = height;
    }
    let progressContainer = me.svg.append("g");
    let r = diameter / 2 - 1.5;

    //环形图底色
    progressContainer.append("circle")
      .attr({
        "class": "progress-container",
        cx: width / 2,
        cy: height / 2,
        r
      });

    let progress = config.data.progress;

    let orgDegrees = progress * 360;
    let cx = width / 2 - Math.sin(orgDegrees * (Math.PI / 180)) * r;
    let cy = height / 2 - Math.cos(orgDegrees * (Math.PI / 180)) * r;

    let degrees = orgDegrees - 4;

    let endX = width / 2 - Math.sin(degrees * (Math.PI / 180)) * r;
    let endY = height / 2 - Math.cos(degrees * (Math.PI / 180)) * r;

    let startRGB;
    let endRGB;
    let centerColor;
    if (config.color instanceof Array) {
      //转换为rgb数组模式
      startRGB = this._colorToRgb(config.color[0]);
      endRGB = this._colorToRgb(config.color[1]);
      //获取中间颜色
      centerColor = this._getCenterColor(startRGB, endRGB);

      let middleX = width / 2 - Math.sin(degrees / 2 * (Math.PI / 180)) * r;
      let middleY = height / 2 - Math.cos(degrees / 2 * (Math.PI / 180)) * r;

      //环形图前半圈进度条
      let startHalf = progressContainer.append("path")
        .attr({
          "class": "progress-start-part",
          fill: "none",
          d: `M${width / 2} 1.5A${r} ${r} 0 0 0 ${middleX} ${middleY}`,
          "stroke-width": "3",
          stroke: `url(#progressGradient_start${me.element})`
        });
      //设置渐变
      this._setProgressGradient([width / 2, 0], [middleX, middleY], startHalf, [config.color[0], centerColor], "start");
      //环形图前半圈进度条
      let endHalf = progressContainer.append("path")
        .attr({
          "class": "progress-end-part",
          fill: "none",
          d: `M${middleX} ${middleY}A${r} ${r} 0 0 0 ${endX} ${endY}`,
          "stroke-width": "3",
          stroke: `url(#progressGradient_end${me.element})`
        });
      //设置渐变
      this._setProgressGradient([middleX, middleY], [endX, endY], endHalf, [centerColor, config.color[1]], "end");


    } else {

      if (!config.color) {
        config.color = "#22C3F7";
      }
      let largeCircle = 0;
      if (degrees > 180) {
        //弧线超过半圆
        largeCircle = 1
      }
      //环形图进度条
      progressContainer.append("path")
        .attr({
          "class": "progress-total",
          fill: "none",
          d: `M${width / 2} 0A${r} ${r} 0 ${largeCircle} 0 ${endX} ${endY}`,
          "stroke-width": "3",
          stroke: config.color
        });
    }

    //结束点
    progressContainer.append("circle")
      .attr({
        "class": "progress-end-point",
        fill: config.color[1],
        cx,
        cy,
        r: 3
      });
    //固定文字
    progressContainer.append("text")
      .attr({
        "class": "progress-fixed-text",
        "text-anchor": orgDegrees >= 165 ? "start" : "end",
        x: cx + (orgDegrees >= 165 ? 7 : -7),
        y: cy
      })
      .text(config.fixedText());


    //窗口变化时重绘曲线
    window.addEventListener("resize", function () {
      if (document.contains(me.svg.node())) {
        let width = me.svg.node().getBoundingClientRect().width;

        //环形图底色
        progressContainer.select(".progress-container")
          .attr({
            cx: width / 2,
            cy: height / 2
          });

        let cx = width / 2 - Math.sin(orgDegrees * (Math.PI / 180)) * r;
        let cy = height / 2 - Math.cos(orgDegrees * (Math.PI / 180)) * r;

        let endX = width / 2 - Math.sin(degrees * (Math.PI / 180)) * r;
        let endY = height / 2 - Math.cos(degrees * (Math.PI / 180)) * r;

        //渐变和进度处理
        if (config.color instanceof Array) {

          let middleX = width / 2 - Math.sin(degrees / 2 * (Math.PI / 180)) * r;
          let middleY = height / 2 - Math.cos(degrees / 2 * (Math.PI / 180)) * r;

          //环形图前半圈进度条
          let startHalf = progressContainer.select(".progress-start-part")
            .attr({
              d: `M${width / 2} 2A${r} ${r} 0 0 0 ${middleX} ${middleY}`
            });
          //更新渐变
          me._updateProgressGradient([width / 2, 0], [middleX, middleY], startHalf, [config.color[0], centerColor], "start");
          //环形图前半圈进度条
          let endHalf = progressContainer.select(".progress-end-part")
            .attr({
              d: `M${middleX} ${middleY}A${r} ${r} 0 0 0 ${endX} ${endY}`
            });
          //更新渐变
          me._updateProgressGradient([middleX, middleY], [endX, endY], endHalf, [centerColor, config.color[1]], "end");


        } else {

          if (!config.color) {
            config.color = "#22C3F7";
          }
          let largeCircle = 0;
          if (degrees > 180) {
            //弧线超过半圆
            largeCircle = 1
          }
          //环形图进度条
          progressContainer.select(".progress-total")
            .attr({
              d: `M${width / 2} 0A${r} ${r} 0 ${largeCircle} 0 ${endX} ${endY}`
            });
        }
        //结束点
        progressContainer.select(".progress-end-point")
          .attr({
            cx,
            cy
          });
        //固定文字
        progressContainer.select(".progress-fixed-text")
          .attr({
            x: cx + (orgDegrees >= 165 ? 7 : -7),
            y: cy
          });
      }
    });
  }

  //设置环形图渐变
  _setProgressGradient(from, to, p, colors, type) {

    let me = this;

    let svgRect = me.svg.node().getBoundingClientRect();
    let pRect = p.node().getBoundingClientRect();

    let top = pRect.top - svgRect.top;
    let left = pRect.left - svgRect.left;
    let width = pRect.width;
    let height = pRect.height;

    let def = me.svg.append("linearGradient")
      .attr({
        id: "progressGradient_" + type + me.element,
        x1: Math.round(from[0] - left) / width * 100 + "%",
        y1: Math.round(from[1] - top) / height * 100 + "%",
        x2: Math.round(to[0] - left) / width * 100 + "%",
        y2: Math.round(to[1] - top) / height * 100 + "%"
      });

    //0%
    def.append("stop")
      .attr({
        offset: "0",
        "stop-color": colors[0]
      });
    //100%
    def.append("stop")
      .attr({
        offset: "1",
        "stop-color": colors[1]
      });
  }

  //设置环形图渐变
  _updateProgressGradient(from, to, p, colors, type) {

    let me = this;

    let svgRect = me.svg.node().getBoundingClientRect();
    let pRect = p.node().getBoundingClientRect();

    let top = pRect.top - svgRect.top;
    let left = pRect.left - svgRect.left;
    let width = pRect.width;
    let height = pRect.height;

    let def = me.svg.select("#progressGradient_" + type + me.element)
      .attr({
        x1: Math.round(from[0] - left) / width * 100 + "%",
        y1: Math.round(from[1] - top) / height * 100 + "%",
        x2: Math.round(to[0] - left) / width * 100 + "%",
        y2: Math.round(to[1] - top) / height * 100 + "%"
      });

    //0%
    def.select("stop")
      .attr({
        "stop-color": colors[0]
      });
    //100%
    def.select("stop")
      .attr({
        "stop-color": colors[1]
      });
  }

  //取两个颜色中间的颜色
  _getCenterColor(startRGB, endRGB) {

    let center = "#";
    for (let i = 0; i < 3; i++) {

      if (startRGB[i] > endRGB[i]) {
        let num = endRGB[i] + (startRGB[i] - endRGB[i]) / 2;
        //转为16进制
        center += parseInt(num).toString(16);
      } else {
        let num = startRGB[i] + (endRGB[i] - startRGB[i]) / 2;
        center += parseInt(num).toString(16);
      }
    }

    return center;
  }

  // 将hex表示方式转换为rgb表示方式(这里返回rgb数组模式)
  _colorToRgb(hexColor) {
    let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    let sColor = hexColor.toLowerCase();
    if (sColor && reg.test(sColor)) {
      if (sColor.length === 4) {
        var sColorNew = "#";
        for (let i = 1; i < 4; i++) {
          sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
        }
        sColor = sColorNew;
      }
      //处理六位的颜色值
      var sColorChange = [];
      for (let i = 1; i < 7; i += 2) {
        sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
      }
      return sColorChange;
    } else {
      return sColor;
    }
  }

  //饼图
  _showPieCharts(index, config) {
    let me = this;
    //画布边距
    me.svg.style("padding", 0);
    let height = me.svg.node().getBoundingClientRect().height;
    let width = me.svg.node().getBoundingClientRect().width;
    let diameter = width;
    //获取直径
    if (height < width) {
      diameter = height;
    }

    let dataset = [];
    let color = [];
    for (let item of config.data) {
      dataset.push(item.value);
      color.push(item.color);
    }

    //饼图
    let pie = d3.layout.pie();
    if (config.autoSort === false) {
      pie.sort(null);
    }

    let outerRadius = diameter / 2;
    let innerRadius = diameter * 3 / 8;
    let arc = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius * 0.95);

    let arcs = me.svg.selectAll("g")
      .data(pie(dataset))
      .enter()
      .append("g")
      .attr("transform", "translate(" + (diameter / 2) + "," + (diameter / 2) + ")");

    let pieChart = arcs.append("path")
      .attr({
        "fill": (d, i) => color[i],
        "d": d => arc(d)
      });

    //鼠标悬浮是否有效
    if (config.pinch !== false) {

      pieChart.on("mouseover", function (d, i) {
        //放大hover中的项
        d3.select(this)
          .transition()
          .duration(300)
          .attr("d", () => {
            const arcTemp = d3.svg.arc()
              .innerRadius(innerRadius * 0.95)
              .outerRadius(outerRadius);

            return arcTemp(d);
          });

        if (config.onMouseover) {

          config.onMouseover({
            value: d,
            index: i
          });
        }

        //显示信息
        me.svg.append("text")
          .attr({
            class: "percent-value",
            "text-anchor": "middle",
            x: diameter / 2,
            y: diameter / 2
          })
          .text(function () {

            let sum = 0;
            for (let v of config.data) {
              sum += Number(v.value);
            }
            const percent = parseFloat((config.data[i].value / sum * 100).toFixed(2)) + "%";
            return percent;

          });

      }).on("mouseout", function (d) {

        d3.select(this)
          .transition()
          .duration(300)
          .attr("d", () => arc(d));
        if (config.onMouseout) {
          config.onMouseout();
        }
        //显示信息
        me.svg.select(".percent-value").remove();
        me._hideHoverText();

      }).on("mousemove", function (d, i) {

        me._pieText(config.data[i]);
      });
    } else if (config.pieText) {

      let pieText = config.pieText();
      //显示信息
      me.svg.append("text")
        .attr({
          class: "pie-text-value",
          "text-anchor": "middle",
          x: diameter / 2,
          y: diameter / 2 - 5
        })
        .text(pieText[0]);
      //显示信息
      me.svg.append("text")
        .attr({
          class: "pie-item-text",
          "text-anchor": "middle",
          x: diameter / 2,
          y: diameter / 2 + 15
        })
        .text(pieText[1]);
    }
  }

  //饼图悬浮文字
  _pieText(param) {
    let me = this;
    //创建或修改文字
    let svgContainer = d3.selectAll(this.element).select(".svg-container");
    let hoverText = svgContainer.selectAll(".hover-text");
    if (hoverText[0].length <= 0) {

      hoverText = svgContainer.append("div")
        .attr({
          "class": "hover-text"
        })
        .style({
          "white-space": "normal",
          "display": "table",
          "word-break": "break-all"
        })
        .text(me.hoverText(param));
    } else {

      hoverText.text(me.hoverText(param));
    }

    //控制文字位置
    let x = window.d3.event.pageX;
    let y = window.d3.event.pageY;

    let w = hoverText.node().getBoundingClientRect().width;

    //超出屏幕处理
    if (w + x + 10 > window.innerWidth) {

      x = window.innerWidth - w - 10;
    }

    svgContainer.node().style.overflow = "visible";

    hoverText
      .style({
        visibility: "visible",
        position: "fixed",
        "max-width": "150px",
        top: y + 5 + "px",
        left: x + 10 + "px"
      });
  }

  // 绘制关系图图表
  _showRelationMap(index, config) {
    if (config.data.length === 0) {
      return;
    }

    let me = this;

    let trans = [0, 0];
    let scale = 1;

    //画布边距
    me.svg.style("padding", 0);
    let height = me.svg.node().getBoundingClientRect().height;
    let width = me.svg.node().getBoundingClientRect().width;

    // me.svg.append("defs")
    //   .append("marker")
    //   .attr('id','relation_arrow')
    //   .attr('markerUnits','strokeWidth')
    //   .attr('markerWidth','12')
    //   .attr('markerHeight','12')
    //   .attr('viewBox','0 0 12 12')
    //   .attr('refX','6')
    //   .attr('refY','6')
    //   .attr('orient','auto')
    //   .append('path')
    //   .attr('d', "M2,2 L10,6 L2,10 L2,2")
    //   .attr('fill','#000');

    let container = me.svg.append('g')
      .call(d3.behavior.zoom().on("zoom", () => {
        const sourceEvent = window.d3.event.sourceEvent;

        if (!sourceEvent) {
          return;
        }

        const scaleChange = sourceEvent.deltaY ? sourceEvent.deltaY * 0.01 : 0;
        if(sourceEvent.type !== 'wheel') {
          const transChangeX = sourceEvent.movementX || 0;
          const transChangeY = sourceEvent.movementY || 0;

          trans[0] += transChangeX;
          trans[1] += transChangeY;
        }

        scale += scaleChange;

        if (scale > 2) {
          scale = 2;
        } else if (scale < 0.5) {
          scale = 0.5;
        }

        container.attr('transform',
          `translate(${trans}) scale(${scale})`);
      }));

    container
      .append('rect')
      .attr({
        width,
        height,
        fill: 'transparent'
      });

    // 关系图group
    container = container
      .append('g')
      .attr({
        'class': 'relations-map-container'
      });

    const centerPos = [width / 2, height / 2];

    config.data[0].x = centerPos[0];
    config.data[0].y = centerPos[1];

    //
    const distance = config.distance || 50;

    this.forceItem = d3.layout.force()
      .size([width, height])
      .charge(-3500)
      .linkDistance(distance);

    this._drawRelations(config, container);
  }

  // 更新数据重绘
  relationMapRedraw() {
    const container = this.svg.select('.relations-map-container');

    // 清除数据
    container.selectAll('g').remove();
    this._drawRelations(this.config[0], container);
  }

  // 绘制关系图主体
  _drawRelations(config, container) {
    let me = this;
    //
    const maxValue = _.maxBy(config.data, 'value').value;

    const maxPointSize = config.maxPointSize || 10;
    const minPointSize = config.minPointSize || 3;
    const each = (maxPointSize - minPointSize) / maxValue;
    //
    const distance = config.distance || 50;

    this._dealRelationData(config.data[0], config.data, distance);

    // 连线数据
    const lineData = this._getLineData(config.data);

    const maxLineWidth = config.maxLineWidth || 6;
    const minLineWidth = config.minLineWidth || 1;

    const maxLineValue = _.maxBy(lineData, 'relation').relation;
    const eachLine = (maxLineWidth - minLineWidth) / maxLineValue;

    const link = container.append("g")
      .attr("class", "relation-line-container")
      .selectAll("path")
      .data(lineData)
      .enter()
      .append("path")
      .attr({
        // 'class': d => (`line_${config.data[d.source].id} line_${config.data[d.target].id}`),
        opacity: 0.6,
        "stroke-width": d => (minLineWidth + (d.relation * eachLine))
      })
      .attr("marker-end", "url(#relation_arrow)");

    const node = container.append("g")
      .attr("class", "relation-point-container")
      .selectAll("circle")
      .data(config.data)
      .enter()
      .append("circle")
      .attr({
        // 'class': d => (`node_${d.id}`),
        r: d => (minPointSize + (d.value * each)),
        fill: d => d.color
      });

    const warningNode = container.append("g")
      .attr("class", "relation-warning-container")
      .selectAll("circle")
      .data(config.data)
      .enter()
      .append("circle")
      .attr({
        r: d => (3 + minPointSize + (d.value * each)),
        fill: 'none',
        opacity: 0.6,
        stroke: '#FF5E76',
        'stroke-width': '2px'
      })
      .style({
        display: d => (d.warningValue >= config.warningLine) ? '' : 'none'
      });

    // 选中的元素
    container.append("g")
      .attr("class", "relation-line-focus-container");
    container.append("g")
      .attr("class", "relation-point-focus-container");

    this.forceItem
      .nodes(config.data)
      .links(lineData)
      .on('tick', this._ticked(link, node, warningNode, container))
      .start();

    node.on('click', (d, i) => {
      clearTimeout(this.clickTimer);
      this.clickTimer = setTimeout(() => {
        //清空
        this.setRelationUnselected();
        this._selectItem(d, i, config, container);
      }, 300);
    });

    link.on('click', (d, i) => {
      //清空
      this.setRelationUnselected();
      this._selectLine(d, i, config, container);
      this._showLineHoverText(d);
    });

    //注册事件
    me._eventRegister(node, config, "circle");
  }

  // 线条提示
  _showLineHoverText(d) {
    let me = this;

    //创建或修改文字
    let svgContainer = d3.selectAll(me.element).select(".svg-container");

    // 悬浮信息
    const hoverText = svgContainer.append("div")
      .attr({
        'class': 'line-hover-text'
      });
    //悬浮文字标题
    hoverText
      .append('h2')
      .attr({
        'class': 'line-hover-title'
      })
      .text(d.relationType);
      // .append('p')
      // .text('标签')
      // .append('span')
      // .text(d.relation);

    hoverText
      .append('p')
      .style({
        color: d.source.color
      })
      .text(`${d.source.type}:${d.source.text}`);

    hoverText
      .append('p')
      .style({
        color: d.target.color
      })
      .text(`${d.target.type}:${d.target.text}`);

    //控制文字位置
    let x = d3.mouse(svgContainer.node())[0];
    let y = d3.mouse(svgContainer.node())[1];
    let textWidth = hoverText.node().getBoundingClientRect().width;
    let textHeight = hoverText.node().getBoundingClientRect().height;
    let svgContainerWidth = svgContainer.node().getBoundingClientRect().width;
    let svgContainerHeight = svgContainer.node().getBoundingClientRect().height;
    if (me.textProps.posFree) {
      svgContainer.node().style.overflow = "visible";
    }
    //超过容器则修正位置
    if (!me.textProps.posFree && textWidth + x + 10 > svgContainerWidth) {
      x = svgContainerWidth - textWidth - me.padding.right;
    }
    if (!me.textProps.posFree && textHeight + y + 5 > svgContainerHeight) {
      y = svgContainerHeight - textHeight - 5;
    }
    hoverText
      .style({
        visibility: "visible",
        top: y + 5 + "px",
        left: x + 10 + "px"
      });
  }

  // 选择关系线
  _selectLine(d, index, config, container) {
    let ids = [d.source.id, d.target.id];

    const line_nodes_container = container
      .selectAll('.relation-line-container, .relation-point-container, .relation-warning-container')
      .attr({
        opacity: 0.2
      });

    line_nodes_container
      .selectAll('path')
      .attr({
        'class': (lineData, i) => i === index ? 'line-focus' : ''
      });
    line_nodes_container
      .selectAll('circle')
      .attr({
        'class': function (d) {
          let className = '';
          if (ids.indexOf(d.id) >= 0) {
            className += 'point-focus';
          }

          if (config.pinch) {
            className += ' point-pinch';
          }
          return className
        }
      });

    // 拷贝线
    const focusLines = container.node().querySelectorAll('.line-focus');
    const focusLineContainer = container.node()
      .querySelector('.relation-line-focus-container');
    for (const line of focusLines) {
      focusLineContainer.appendChild(line.cloneNode());
    }
    // 拷贝点
    const focusPoints = container.node().querySelectorAll('.point-focus');
    const focusData = d3.selectAll(focusPoints).data();
    const focusPointsContainer = container.node()
      .querySelector('.relation-point-focus-container');
    for (const point of focusPoints) {
      focusPointsContainer.appendChild(point.cloneNode());
    }

    container
      .selectAll('.relation-point-focus-container circle')
      .on('click', () => {
        //清空
        this.setRelationUnselected();
      })
      .on('mousemove', (o, i) => {
        const curData = focusData[i];
        this._showHoverText(curData);
      })
      .on('mouseout', () => {
        this._hideHoverText();
      });
    container
      .selectAll('.relation-line-focus-container path')
      .on('click', () => {
        //清空
        this.setRelationUnselected();
      });
  }

  // 选择节点
  _selectItem(d, i, config, container) {
    //清空
    container.select('.relation-line-focus-container').html('');
    container.select('.relation-point-focus-container').html('');
    this.relationFocusItem = d;

    // 调用选中事件
    if (config.selectPoint) {
      let relatedItems = _.cloneDeep(d.target);
      const parentItems = _.filter(
        config.data,
        item => _.find(item.target, { id: d.id })
      );

      _.map(parentItems, (item) => {
        const curRelations = _.filter(item.target, { id: d.id });
        _.map(curRelations, (o) => {
          relatedItems.push({
            id: item.id,
            relationType: o.relationType,
            relation: o.relation
          });
        });
      });

      // 选中元素的关联数据
      const selectRelatedItems = _.map(relatedItems, (item) => {
        const itemInfo = _.find(config.data, { id: item.id });
        return Object.assign({}, itemInfo, item);
      });

      config.selectPoint({
        index: i,
        value: d
      }, selectRelatedItems);
    }
    // 选中元素
    this._focusItem(d, config, container);
  }

  // 过滤关系图
  setRelationFilter(relationFilter) {
    this.relationFilter = relationFilter;
    const container = this.svg.select('.relations-map-container');
    //清空
    container.select('.relation-line-focus-container').html('');
    container.select('.relation-point-focus-container').html('');

    this._focusItem(this.relationFocusItem, this.config[0], container);
  };

  // 过滤关系图
  setShowFilter(showFilter) {
    const container = this.svg.select('.relations-map-container');
    if (!showFilter) {
      container
        .select('.relation-point-container')
        .selectAll('circle')
        .style({
          display: ''
        });
      container
        .select('.relation-warning-container')
        .selectAll('circle')
        .style({
          display: d => (d.warningValue >= this.config[0].warningLine) ? '' : 'none'
        });

      container
        .select('.relation-line-container')
        .selectAll('path')
        .style({
          display: ''
        });
      return;
    }
    const {
      ids,
      relations
    } = showFilter;
    //清空
    // container.select('.relation-line-focus-container').html('');
    // container.select('.relation-point-focus-container').html('');
    container
      .select('.relation-point-container')
      .selectAll('circle')
      .style({
        display: d => !ids || ids.indexOf(d.id) >= 0 ? '' : 'none'
      });
    container
      .select('.relation-warning-container')
      .selectAll('circle')
      .style({
        display: d => (d.warningValue >= this.config[0].warningLine) && (!ids || ids.indexOf(d.id) >= 0) ? '' : 'none'
      });

    container
      .select('.relation-line-container')
      .selectAll('path')
      .style({
        display: d => {
          if (ids &&
            (ids.indexOf(d.source.id) < 0 ||
              ids.indexOf(d.target.id) < 0)) {
            return 'none';
          }
          if (relations && relations.indexOf(d.relation) < 0) {
            return 'none';
          }
          return '';
        }
      });
  };

  // 选中元素
  _focusItem(d, config, container) {
    // 过滤器
    const {
      relationType,
      type
    } = this.relationFilter;

    let ids = [d.id];
    ids = ids.concat(_.map(d.target, o => o.id));
    _.filter(config.data, item => _.find(item.target, { id: d.id })).forEach(targetItem => {
      ids.push(targetItem.id);
    });

    const line_nodes_container = container
      .selectAll('.relation-line-container, .relation-point-container, .relation-warning-container')
      .attr({
        opacity: 0.2
      });

    line_nodes_container
      .selectAll('path')
      .attr({
        'class': (lineData) => {
          if (relationType.indexOf(lineData.relationType) >= 0) {
            return '';
          }
          if ((type.indexOf(lineData.source.type) >= 0 && d.id !== lineData.source.id) ||
            (type.indexOf(lineData.target.type) >= 0 && d.id !== lineData.target.id)) {
            return '';
          }
          return d.id === lineData.source.id || d.id === lineData.target.id ? 'line-focus' : ''
        }
      });
    line_nodes_container
      .selectAll('circle')
      .attr({
        'class': function (item) {
          let className = '';
          if (item.id === d.id || (type.indexOf(item.type) < 0 && ids.indexOf(item.id) >= 0)) {
            className += 'point-focus';
          }

          if (config.pinch) {
            className += ' point-pinch';
          }
          return className
        }
      });

    // 拷贝线
    const focusLines = container.node().querySelectorAll('.line-focus');
    const focusLineContainer = container.node()
      .querySelector('.relation-line-focus-container');
    for (const line of focusLines) {
      focusLineContainer.appendChild(line.cloneNode());
    }
    // 拷贝点
    const focusPoints = container.node().querySelectorAll('.point-focus');
    const focusData = d3.selectAll(focusPoints).data();
    const focusPointsContainer = container.node()
      .querySelector('.relation-point-focus-container');
    for (const point of focusPoints) {
      focusPointsContainer.appendChild(point.cloneNode());
    }

    container
      .selectAll('.relation-point-focus-container circle')
      .on('click', (o, i) => {
        const curData = focusData[i];
        if (curData.id === d.id) {
          //清空
          this.setRelationUnselected();
        } else {
          const index = _.findIndex(config.data, { id: curData.id });
          // 选中
          this._selectItem(curData, index, config, container);
        }
      })
      .on('mousemove', (o, i) => {
        const curData = focusData[i];
        this._showHoverText(curData);
      })
      .on('mouseout', () => {
        this._hideHoverText();
      });
  }

  // 设置不选中
  setRelationUnselected() {
    const container = this.svg.select('.relations-map-container');
    //清空
    container.select('.relation-line-focus-container').html('');
    container.select('.relation-point-focus-container').html('');

    container
      .selectAll(".relation-line-container, .relation-point-container, .relation-warning-container")
      .attr({
        opacity: 1
      });

    if (this.config[0].selectPoint) {
      this.config[0].selectPoint(null);
    }

    let svgContainer = d3.selectAll(this.element).select(".svg-container");
    svgContainer.selectAll(".line-hover-text").remove();
  }

  // 力学图事件
  _ticked(link, node, warningNode, container) {
    const linkArc = (d) => {
      if (d.countTarget === 0) {
        return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`
      }
      const dx = d.target.x - d.source.x;
      const dy = d.target.y - d.source.y;
      let dr = (Math.sqrt(dx * dx + dy * dy)) / (Math.sqrt(d.countTarget));

      if (d.countTarget % 2 === 1) {
        return `M${d.target.x},${d.target.y}A${dr},${dr} 0 0,1 ${d.source.x},${d.source.y}`;
      }
      // 偶数与奇数对称
      dr = (Math.sqrt(dx * dx + dy * dy)) / (Math.sqrt(d.countTarget / 2));
      return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
    };
    return () => {
      link
        .attr({
          d: linkArc
        });

      node
        .attr({
          cx: d => d.x,
          cy: d => d.y
        });

      warningNode
        .attr({
          cx: d => d.x,
          cy: d => d.y
        });

      // 选中点更新位置
      const focusPoints = container.node().querySelectorAll('.point-focus');
      const focusPointsData = d3.selectAll(focusPoints).data();
      container
        .selectAll('.relation-point-focus-container circle')
        .attr({
          cx: (d, i) => focusPointsData[i].x,
          cy: (d, i) => focusPointsData[i].y
        });

      // 选中点更新位置
      const focusLines = container.node().querySelectorAll('.line-focus');
      const focusLinesData = d3.selectAll(focusLines).data();
      container
        .selectAll('.relation-line-focus-container path')
        .attr({
          d: (d, i) => linkArc(focusLinesData[i])
        });
    }
  }

  // 处理关系数据，计算初始坐标
  _dealRelationData(item, data, distance) {
    const rad = item.target.length ? ((Math.PI * 2) / item.target.length) : 0;

    for (const [index, childTarget] of item.target.entries()) {
      const childItem = _.find(data, { id: childTarget.id });

      // 有坐标数据
      if (childItem.x === undefined) {
        let randomDistance = distance * (1 + Math.random());
        // 子节点不止一个连接点，设置距离远一点
        if (childItem.target.length > 1) {
          randomDistance += (distance * 2);
        }

        childItem.x = item.x + (randomDistance * Math.cos(rad * index));
        childItem.y = item.y + (randomDistance * Math.sin(rad * index));
      }

      // 递归处理关系数据
      this._dealRelationData(childItem, data, distance);
    }
  }

  // 获取连线数据
  _getLineData(data) {
    const lineData = [];
    for (const [index, item] of data.entries()) {
      for (const childTarget of item.target) {
        const childItemIndex = _.findIndex(data, { id: childTarget.id });

        if (_.find(lineData, { source: childItemIndex })) {
          continue;
        }

        // 连线
        const lineItem = {
          source: index,
          target: childItemIndex,
          targetId: childTarget.id,
          value: data[childItemIndex].value,
          relation: childTarget.relation,
          relationType: childTarget.relationType,
          countTarget: _.filter(lineData, { target: childItemIndex }).length
        };

        lineData.push(lineItem);
      }
    }
    return lineData;
  }

  //3d地球图表
  _show3DEarth(index, config) {
    let me = this;

    let canvasContainer = d3.select(this.element).node();
    let width = canvasContainer.clientWidth;//获取画布「canvas3d」的宽
    let height = canvasContainer.clientHeight;//获取画布「canvas3d」的高
    let ballWidth = height;
    if (width < height) {
      ballWidth = width;
    }
    ballWidth *= 0.7;

    let renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    renderer.setClearColor(0x000000);
    renderer.setSize(width, height);
    let canvas = renderer.domElement;
    canvasContainer.append(canvas);

    let scene = new THREE.Scene();

    // camera
    let camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 1000);
    camera.position.set(0, 0, ballWidth);
    //camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(camera);

    // light
    let light = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(light);

    let loader = new THREE.TextureLoader();
    loader.load(
      me.resourcePath + "111.jpg",
      function (texture) {

        let material = new THREE.MeshPhongMaterial({
          map: texture
        });

        //绘制地球
        var earth = new THREE.Mesh(
          new THREE.SphereGeometry(ballWidth / 2, 50, 50),
          material
        );
        //地球光圈
        loader.load(
          me.resourcePath + "2.png",
          function (texture) {
            var circle = new THREE.SpriteMaterial({ map: texture, opacity: .8, blending: THREE.AdditiveBlending });
            var glow = new THREE.Sprite(circle);
            glow.scale.set(ballWidth * 1.18, ballWidth * 1.18, ballWidth * 1.18);
            earth.add(glow);
            renderer.render(scene, camera);
          }
        );

        //调整转向，将中国朝向前方
        earth.rotation.y = Math.PI * 0.9;
        earth.rotation.x = Math.PI * 0.13;
        scene.add(earth);

        //处理经纬度
        let lnglatList = config.data;
        let points = me._dealLngLat(lnglatList);

        //云
        var obj = new THREE.Object3D;
        for (let i = 0; i < 3; i++) {
          loader.load(
            me.resourcePath + "cloud" + i + ".png",
            function (texture) {
              for (let i = 0; i < 17; i++) {
                var cloudMaterial = new THREE.SpriteMaterial({
                  map: texture,
                  //depthWrite: false,
                  depthTest: false,
                  transparent: true,
                  //renderOrder: 999,
                  rotation: Math.PI * 2 * Math.random()
                });
                var cloud = new THREE.Sprite(cloudMaterial);
                var rad1 = Math.random() * Math.PI * 2;
                var rad2 = Math.random() * Math.PI;
                var pos = Math.random() + ballWidth / 2;
                cloud.position.x = pos * Math.sin(rad2) * Math.cos(rad1);
                cloud.position.y = pos * Math.sin(rad2) * Math.sin(rad1);
                cloud.position.z = pos * Math.cos(rad2);
                var scale = (ballWidth / 8) * Math.random() + ballWidth / 4;
                cloud.scale.set(scale, scale, scale);
                obj.add(cloud);
              }
              earth.add(obj);
              //scene.add(obj);
            }
          );
        }

        renderer.render(scene, camera);

        let id = requestAnimationFrame(draw);

        function draw() {

          //if (!MOUSEDOWN) {
          earth.rotation.y = earth.rotation.y + 0.001;
          //}
          //控制云层透明度
          for (var i = 0; i < obj.children.length; i++) {
            var vec = new THREE.Vector3;
            var cloud = obj.children[i];
            vec.setFromMatrixPosition(cloud.matrixWorld);
            cloud.material.rotation += .002;
            if (vec.z < ballWidth / 2) {
              cloud.material.opacity = vec.z / (ballWidth / 2) * 0.2;
            } else {
              cloud.material.opacity = 0.2;
            }
          }
          renderer.render(scene, camera);
          id = requestAnimationFrame(draw);

        }
      }
    );
  }

  //转化经纬度为坐标
  _dealLngLat(lnglatList) {
    const points = [];
    for (let i = 0; i < lnglatList.length; i++) {
      //经度转化角度
      const lng = 180 - lnglatList[i][0];
      const lat = lnglatList[i][1];
      const rady = (lng - 180) / 180 * Math.PI;
      const radx = lat / 180 * Math.PI;

      const posx = 4.1 * Math.cos(radx) * Math.cos(rady);
      const posy = 4.1 * Math.sin(radx);
      const posz = 4.1 * Math.cos(radx) * Math.sin(rady);

      points.push(new THREE.Vector3(posx, posy, posz));
    }

    return points;
  }

  //缩放事件
  _zoomEvent(path, config, projection) {
    let me = this;

    let map = me.svg.select(".map-container");

    let initTran = projection.translate();
    let initScale = projection.scale();

    //缩放拖动事件
    return d3.behavior.zoom()
      .scaleExtent([1, 10])
      .on("zoom", () => {
        let x = window.d3.event.translate[0];
        let y = window.d3.event.translate[1];
        if (window.d3.event.translate[0] > (initTran[0] * window.d3.event.scale)) {
          x = initTran[0] * window.d3.event.scale;
        } else if (window.d3.event.translate[0] < -(initTran[0] * window.d3.event.scale)) {
          x = -initTran[0] * window.d3.event.scale;
        }
        if (window.d3.event.translate[1] > (initTran[1] * window.d3.event.scale)) {
          y = initTran[1] * window.d3.event.scale;
        } else if (window.d3.event.translate[1] < -(initTran[1] * window.d3.event.scale)) {
          y = -initTran[1] * window.d3.event.scale;
        }
        projection.translate([
          initTran[0] + x,
          initTran[1] + y
        ]);
        projection.scale(initScale * window.d3.event.scale);
        map.selectAll("path")
          .attr("d", path);
        //绘制散点
        me._mapPointDeal(config, projection);
      });
  }

  //动画
  _createCircleAnimate(circleContainer, proPeking, pointScale, item) {
    let me = this;
    for (let i = 0; i < 3; i++) {
      //添加动画
      let circle = circleContainer.append("circle")
        .datum({
          lng: item[0],
          lat: item[1],
          value: item[2]
        })
        .style({
          "stroke": () => me.mapThreshold.color
        })
        .attr({
          "class": "hollow-circle",
          "cx": proPeking[0],
          "cy": proPeking[1],
          "r": pointScale(item[2])
        });
      //半径变化
      circle.append("animate")
        .attr({
          "attributeName": "r",
          "from": pointScale(item[2]),
          "to": pointScale(item[2]) + 12,
          "begin": i + "s",
          "dur": "3s",
          "repeatCount": "indefinite"
        });
      //渐变消失
      circle.append("animate")
        .attr({
          "attributeName": "opacity",
          "from": 0.6,
          "to": 0,
          "begin": i + "s",
          "dur": "3s",
          "repeatCount": "indefinite"
        });
    }
  }

  //显示数据区域内容
  _showDataZoom() {
    let me = this;
    let config = me.config[me.dataZoom.dataIndex];
    //绘制边框
    me._dataZoomBorder();

    let yData = [];
    //折线图数据
    for (let item of config.dataAll) {
      yData.push(item.y);
    }
    //坐标轴的比例尺
    let scale = d3.scale.linear()
      .domain([0, Math.max(...yData) * 1.1])
      .range([0, 100]);
    //绘制数据区域
    me._showDataZoomCharts(config, scale);

    //绘制操作控件
    me._showZoomBar();

  }

  //绘制边框
  _dataZoomBorder() {
    let me = this;
    //绘制边框
    me.zoomSvg.append("line")
      .attr({
        "class": "data-zoom-border",
        "x1": "0",
        "y1": "0",
        "x2": "100%",
        "y2": "0"
      });
    me.zoomSvg.append("line")
      .attr({
        "class": "data-zoom-border",
        "x1": "0",
        "y1": "100%",
        "x2": "100%",
        "y2": "100%"
      });
    me.zoomSvg.append("line")
      .attr({
        "class": "data-zoom-border",
        "x1": "0",
        "y1": "0",
        "x2": "0",
        "y2": "100%"
      });
    me.zoomSvg.append("line")
      .attr({
        "class": "data-zoom-border",
        "x1": "100%",
        "y1": "0",
        "x2": "100%",
        "y2": "100%"
      });
  }

  //绘制数据区域
  _showDataZoomCharts(config, scale) {
    let me = this;
    let fullData = config.dataAll;
    //曲线图数据
    let dataset = [];
    //具体数据集
    let dataAll = [];
    //重新组装数据
    for (let item of fullData) {
      dataAll.push({
        x: item.x,
        y: item.y,
        dataName: config.name
      });
      dataset.push(item.y);
    }

    //曲线生成器
    let lineFunction = d3.svg.area()
      .x((d, i) => {
        //获取画布容器宽度
        let width = me.zoomSvg.node().getBoundingClientRect().width - 20;
        let count = dataset.length - 1;
        let scale = 100 / count;
        return width * scale * i / 100;
      })
      .y0(me.zoomSvg.node().getBoundingClientRect().height - 10)
      .y1((d, i) => {

        let height = me.zoomSvg.node().getBoundingClientRect().height - 10;
        let scalePos = 1 - (scale(dataset[i]) / 100);
        if (scalePos === 1) {
          //数据为0
          return height;
        }
        //如果数据不为0则最低2px;
        return ((height - 2) * scalePos);
      })
      .interpolate("monotone");

    //把path扔到容器中，并给d赋属性
    let lineContainer = me.zoomSvg.append("g").attr("class", "zoom-line-container");
    lineContainer.append("path")
      .attr({
        "class": "data-zoom-area",
        "d": lineFunction(dataset)
      });
    //窗口变化时重绘曲线
    window.addEventListener("resize", function () {
      if (document.contains(me.zoomSvg.node())) {
        me.zoomSvg.select(".data-zoom-area").attr("d", lineFunction(dataset));
      }
    });
  }

  //绘制数据区域操作控件
  _showZoomBar() {
    let me = this;
    let orgPos;
    //拖动事件
    let drag = d3.behavior.drag()
      .on("drag", function (d) {
        let xPos = window.d3.event.x;
        if (orgPos === undefined) {
          orgPos = xPos;
        }
        let width = me.zoomSvg.node().getBoundingClientRect().width - 20;
        let posScale = xPos / width * 100;
        let areaWidth = me.dataZoom.end - me.dataZoom.start;
        if (d.type == "start") {
          if (xPos < 0) {
            xPos = 0;
          }
          if (posScale > me.dataZoom.end) {
            xPos = me.dataZoom.end / 100 * width;
          }
          //结束bar位置不能超出控件
          if (xPos / width * 100 + areaWidth > 100) {
            xPos = (100 - areaWidth) / 100 * width;
          }
          me.dataZoom.start = xPos / width * 100;
          if (me.dataZoom.type == "fixed") {
            me.dataZoom.end = me.dataZoom.start + areaWidth;
          }
        } else if (d.type == "end") {
          if (xPos > width) {
            xPos = width;
          }
          if (posScale < me.dataZoom.start) {
            xPos = me.dataZoom.start / 100 * width;
          }
          //起始bar位置不能超出控件
          if (xPos / width * 100 - areaWidth < 0) {
            xPos = areaWidth / 100 * width;
          }
          me.dataZoom.end = xPos / width * 100;
          if (me.dataZoom.type == "fixed") {
            me.dataZoom.start = me.dataZoom.end - areaWidth;
          }
        } else if (d.type == "area") {
          let startPos = me.dataZoom.start / 100 * width - (orgPos - xPos);
          if (startPos < 0) {
            startPos = 0;
          }
          if (startPos / width * 100 + areaWidth > 100) {
            startPos = (100 - areaWidth) / 100 * width;
          }
          me.dataZoom.start = startPos / width * 100;
          me.dataZoom.end = me.dataZoom.start + areaWidth;
        }


        if (me.dataZoom.type == "fixed") {
          let ele = d3.select(me.element);
          //起始控件
          ele.select(".data-zoom-start-bar")
            .attr({
              "x": me.dataZoom.start + "%"
            });
          //结束控件
          ele.select(".data-zoom-end-bar")
            .attr({
              "x": me.dataZoom.end + "%"
            });
        } else {
          //当前控件
          d3.select(this)
            .attr({
              "x": (d) => ((d.type === "start") ? me.dataZoom.start : me.dataZoom.end) + "%"
            });
        }


        //调整数据区域
        d3.select(me.element)
          .select(".data-zoom")
          .attr({
            "width": () => {
              return (me.dataZoom.end - me.dataZoom.start) + "%";
            },
            "x": me.dataZoom.start + "%"
          });
        //赋值
        orgPos = xPos;
        if (me.dataZoom.freshTime !== "end") {
          me._updateDataZoom();
        }
      }).on("dragend", function () {
        orgPos = undefined;
        if (me.dataZoom.freshTime === "end") {
          me._updateDataZoom();
        }
      });

    //数据区域控件
    let area = me.zoomSvg.append("rect")
      .datum({
        type: "area"
      })
      .attr({
        "class": "data-zoom",
        "width": (me.dataZoom.end - me.dataZoom.start) + "%",
        "height": "100%",
        "x": me.dataZoom.start + "%",
        "y": 0
      });

    //区域固定
    if (me.dataZoom.type == "fixed") {
      area.call(drag);
    }

    //数据起始控件
    let startBar = me.zoomSvg.append("rect")
      .datum({
        type: "start"
      })
      .attr({
        "class": "data-zoom-start-bar",
        "width": "10px",
        "height": "100%",
        "x": me.dataZoom.start + "%",
        "y": 0
      })
      .call(drag);
    //数据结束控件
    me.zoomSvg.append("rect")
      .datum({
        type: "end"
      })
      .attr({
        "class": "data-zoom-end-bar",
        "width": "10px",
        "height": "100%",
        "x": me.dataZoom.end + "%",
        "y": 0
      })
      .call(drag);
  }

  //更新数据区域
  _updateDataZoom() {
    let me = this;

    let dataAll = me.config[me.dataZoom.dataIndex].dataAll;

    //存入当前数据范围
    let min = Math.trunc(dataAll.length * (me.dataZoom.start / 100));
    let max;
    if (me.dataZoom.type = "fixed") {
      max = min + me.dataZoom.width - 1;
    } else {
      max = Math.trunc(dataAll.length * (me.dataZoom.end / 100));
    }
    if (me.dataZoom.minIndex === min && me.dataZoom.maxIndex === max) {
      //数据没有更新
      return;
    }

    //图表容器
    let element = me.element;
    let chartContainer = d3.select(element);
    //检查元素是否合法
    if (!chartContainer.node()) {
      me._exception(`没有找到${element}元素`);
    }
    //绘制画布前，如果有画布则清空画布容器
    try {
      chartContainer.select(".svg-container").select(".svg-view").remove();
    } catch (e) {
    }

    //添加SVG画布
    me.svg = d3.select(element)
      .select(".svg-container")
      .insert("svg", ".data-zoom-view")
      .style({
        "height": (me.dataZoom) ? "calc(100% - 30px)" : "100%"
      })
      .attr({
        "class": "svg-view",
        "width": "100%"
      });

    me.dataZoom.minIndex = min;
    me.dataZoom.maxIndex = max;


    for (let item of me.config) {
      let configData = item.dataAll;
      let limitData = [];
      for (let [i, v] of configData.entries()) {
        if (i >= me.dataZoom.minIndex && i <= me.dataZoom.maxIndex) {
          limitData.push(v);
        }
      }
      item.data = limitData;
      //数据初始化
      me.xAxis[item.xAxis].data = undefined;
      me.yAxis[item.yAxis].data = undefined;
    }

    //获取坐标轴数据
    me._getAxisData();
    //绘制坐标轴
    me._initAxis();
    //绘制图表
    me._chartsInit();

    if (me.dataZoom.onChange) {
      me.dataZoom.onChange({
        minIndex: min,
        maxIndex: max
      });
    }

    if (me.dataZoom.bind) {

      let bindConfig = me.dataZoom.bind.config;

      for (let item of bindConfig) {
        let configData = item.dataAll;
        let limitData = [];
        for (let [i, v] of configData.entries()) {
          if (i >= me.dataZoom.minIndex && i <= me.dataZoom.maxIndex) {
            limitData.push(v);
          }
        }
        item.data = limitData;
      }
      //同步更新警告图表
      me.dataZoom.bind.update();

    }

  }

  //标尺控制
  _cursorCtrl(config, dataset) {
    let me = this;

    let type = me.hoverCursorType;
    let yAxis = me.yAxis;
    let xAxis = me.xAxis;
    let bottom = "X";
    for (let item of yAxis) {
      if (item.type === "category") {
        bottom = "Y";
        break;
      }
    }

    let boundaryGap;
    if (bottom === "X") {
      boundaryGap = xAxis[0].boundaryGap;
    } else {
      boundaryGap = yAxis[0].boundaryGap;
    }
    let scale = 100 / dataset.length;
    if (!boundaryGap) {
      scale = 100 / (dataset.length - 1);
    }

    //是否显示鼠标悬浮时的效果
    if (me.hoverCursor || me.hoverText) {
      let index = 0;
      let cursorClass = (config[0].cusorType || type) === "line" ? "line-hover-cursor" : "hover-cursor";
      me.svg.on("mousemove", () => {
        //获取鼠标位置和容器宽度
        let pointerConf = me._getPointerConf();
        //已移出容器
        if (pointerConf.x < 0 || pointerConf.x > pointerConf.w
          || pointerConf.y < 0 || pointerConf.y > pointerConf.h) {
          me._makeCursor(scale, index, "hidden", cursorClass, false, bottom);
          if (me.hoverText) {
            me._hideHoverText();
          }
          return;
        }
        let pos = 0;
        if (bottom === "X") {
          pos = pointerConf.x / pointerConf.w * 100;
        } else {
          pos = pointerConf.y / pointerConf.h * 100;
        }
        //第几条数据
        let orgIndex = Math.abs(pos) / scale;
        if (!boundaryGap) {
          //起效区域向后推半格
          orgIndex += 0.5;
        }
        index = Math.trunc(orgIndex);
        //index数值限制
        index = index >= dataset.length ? dataset.length - 1 : index;
        if (me.hoverText) {
          let params = [];
          for (let item of config) {
            let hoverIndex = index;
            if (bottom === "Y") {
              hoverIndex = (dataset.length - 1) - index;
              if (yAxis[item.yAxis].flip) {
                hoverIndex = index;
              }
            } else {
              if (xAxis[item.xAxis].flip) {
                hoverIndex = (dataset.length - 1) - index;
              }
            }
            //原始数据
            let orgData = item.data;
            params.push(Object.assign({}, {
              name: item.name,
              index: index,
              color: item.color
            }, orgData[hoverIndex]));
          }
          me._showHoverText(params);
        }

        let bind = (me.hoverCursor && me.hoverCursor.length > 0) ? me.hoverCursor : false;
        me._makeCursor(scale, index, "visible", cursorClass, bind, bottom);
      });
      me.svg.on("mouseout", () => {
        //获取鼠标位置和容器宽度
        let pointerConf = me._getPointerConf();
        //已移出容器
        if (pointerConf.x < 0 || pointerConf.x > pointerConf.w || pointerConf.y < 0 || pointerConf.y > pointerConf.h) {
          let bind = (me.hoverCursor && me.hoverCursor.length > 0) ? me.hoverCursor : false;
          me._makeCursor(scale, index, "hidden", cursorClass, bind, bottom);
          if (me.hoverText) {
            me._hideHoverText();
          }
        }
      });
    }
    //点击显示标尺
    if (me.clickCursor) {
      //有默认标尺则显示
      if (me.defaultCursor) {
        let defaultIndex = 0;
        if (bottom === "X") {
          defaultIndex = xAxis[0].data.indexOf(me.defaultCursor.x);
        } else {
          defaultIndex = yAxis[0].data.indexOf(me.defaultCursor.y);
        }
        if (defaultIndex >= 0) {
          me._makeCursor(scale, defaultIndex, "visible", "chart-cursor", false, bottom, dataset.length - 1);
        }
      }
      me.svg.on("click", () => {
        //获取鼠标位置和容器宽度
        let pointerConf = me._getPointerConf();
        //已移出容器
        if (pointerConf.x < 0 || pointerConf.x > pointerConf.w
          || pointerConf.y < 0 || pointerConf.y > pointerConf.h) {
          return;
        }
        let pos = 0;
        if (bottom === "X") {
          pos = pointerConf.x / pointerConf.w * 100;
        } else {
          pos = pointerConf.y / pointerConf.h * 100;
        }
        let orgIndex = Math.abs(pos) / scale;
        if (!boundaryGap) {
          //起效区域向后推半格
          orgIndex += 0.5;
        }
        let index = Math.trunc(orgIndex);
        //index数值限制
        index = index >= dataset.length ? dataset.length - 1 : index;
        let bind = (me.clickCursor && me.clickCursor.length > 0) ? me.clickCursor : false;

        for (let configItem of config) {
          if (configItem.onClick) {
            configItem.onClick({
              value: Object.assign({}, configItem.data[index], { dataName: configItem.name }),
              index: index
            });
          }
        }

        me.defaultCursor = config[0].data[index];

        if (me.onCursorClick) {
          me.onCursorClick({
            value: config[0].data[index],
            index: index
          });
        }

        me._makeCursor(scale, index, "visible", "chart-cursor", bind, bottom, dataset.length - 1);
      })
    }
  }

  //获取鼠标位置和容器宽度
  _getPointerConf() {
    let me = this;
    //获取鼠标相对于container的位置
    let x = d3.mouse(me.svg.node().parentElement)[0] - me.padding.left;
    let y = d3.mouse(me.svg.node().parentElement)[1] - me.padding.top;
    //let x = window.d3.event.offsetX - me.padding.left;
    //let y = window.d3.event.offsetY - me.padding.top;
    //console.log(window.d3.event.currentTarget);
    //取container容器宽度
    let w = me.svg.node().getBoundingClientRect().width - me.padding.left - me.padding.right;
    let h = me.svg.node().getBoundingClientRect().height - me.padding.top - me.padding.bottom;

    return { x, y, w, h };
  }

  //创建标尺
  _makeCursor(scale, i, visibility, className, isBind, bottom, dataLength) {

    let me = this;
    let ele = d3.select(me.element).select(".svg-view");

    let yAxis = me.yAxis;
    let xAxis = me.xAxis;

    let boundaryGap;
    if (bottom === "X") {
      boundaryGap = xAxis[0].boundaryGap;
    } else {
      boundaryGap = yAxis[0].boundaryGap;
    }

    //标尺对象
    let cursor = {};
    if (!ele.selectAll("." + className)[0]) {
      return;
    }
    if (ele.selectAll("." + className)[0].length > 0) {
      cursor = ele.selectAll("." + className).attr({
        //曲线图，向左平移半格
        "x": () => {
          if (bottom === "X") {
            return ((className !== "line-hover-cursor" || !boundaryGap) ? scale * i : scale * i + scale / 2) + "%";
          }
          return 0;
        },
        "y": () => {
          if (bottom === "X") {
            return 0;
          }
          return ((className !== "line-hover-cursor" || !boundaryGap) ? scale * i : scale * i + scale / 2) + "%";
        },
        visibility: visibility
      });
    } else {
      //绘制标尺
      cursor = ele.append("rect")
        .attr({
          "class": className,
          //曲线图，向左平移半格
          "x": () => {
            if (bottom === "X") {
              return ((className !== "line-hover-cursor" || !boundaryGap) ? scale * i : scale * i + scale / 2) + "%";
            }
            return 0;
          },
          "y": () => {
            if (bottom === "X") {
              return 0;
            }
            return ((className !== "line-hover-cursor" || !boundaryGap) ? scale * i : scale * i + scale / 2) + "%";
          },
          "width": () => {
            if (bottom === "X") {
              if (className === "line-hover-cursor" || !boundaryGap) {
                return 1;
              }
              return scale + "%";
            }
            return "100%";
          },
          "height": () => {
            if (bottom === "X") {
              return "100%";
            }
            if (className === "line-hover-cursor" || !boundaryGap) {
              return 1;
            }
            return scale + "%";
          },
          "visibility": visibility
        });
    }
    //绑定图表联动
    if (isBind) {
      if (me.hoverCursor && me.hoverCursor.length > 0) {
        for (let item of me.hoverCursor) {
          if (!item) {
            continue;
          }
          let btm = "X";
          let index = i;
          for (let axis of item.yAxis) {
            if (axis.type === "category") {
              btm = "Y";
            }
          }
          if (btm !== bottom) {
            index = dataLength - i;
          }
          item._makeCursor(scale, index, visibility, className, false, btm);
        }
      }
      if (me.clickCursor && me.clickCursor.length > 0) {
        for (let item of me.clickCursor) {
          if (!item) {
            continue;
          }
          let btm = "X";
          let index = i;
          for (let axis of item.yAxis) {
            if (axis.type === "category") {
              btm = "Y";
            }
          }
          if (btm !== bottom) {
            index = dataLength - i;
          }
          item._makeCursor(scale, index, visibility, className, false, btm);
        }
      }
    }
    return cursor;
  }

  //鼠标悬浮显示数据
  _showHoverText(param) {
    let me = this;
    //文字内容
    let text = [];

    if (param instanceof Array) {
      for (let item of param) {
        text.push(me.hoverText(item));
      }
    } else {
      text = me.hoverText(param);
    }

    //创建或修改文字
    let svgContainer = d3.selectAll(me.element).select(".svg-container");
    let hoverText = svgContainer.selectAll(".hover-text");
    if (hoverText[0].length <= 0) {
      hoverText = svgContainer.append("div")
        .attr({
          "class": "hover-text"
        });
      //悬浮文字标题
      if (me.hoverTitle) {
        hoverText.append("p")
          .attr({
            "class": "hover-title"
          })
          .text(me.hoverTitle(param[0]));
      }
      if (text instanceof Array) {
        for (let [i, value] of text.entries()) {
          if (value instanceof Array) {
            for (let [i1, v1] of value.entries()) {
              let p = hoverText.append("p");
              p.append("span").datum({ i1: i, i2: i1 }).text(v1);
            }
          } else {
            let p = hoverText.append("p");
            if (text.length > 1 && param[i].color) {
              if (param[i].color instanceof Array) {
                p.append("i").style("background-color", param[i].color[1]);
              } else {
                p.append("i").style("background-color", param[i].color);
              }
            }
            p.append("span").datum({ i1: i }).text(value);
          }
        }
      } else {
        hoverText.text(text);
      }
    } else {
      if (text instanceof Array) {
        //悬浮文字标题
        if (me.hoverTitle) {
          hoverText.selectAll(".hover-title")
            .text(me.hoverTitle(param[0]));
        }

        hoverText.selectAll("p")
          .selectAll("span")
          .text((d) => {
            if (d.i2 === undefined) {
              return text[d.i1];
            }
            return text[d.i1][d.i2];
          });
      } else {
        hoverText.text(text);
      }
    }
    //控制文字位置
    let x = d3.mouse(svgContainer.node())[0];
    let y = d3.mouse(svgContainer.node())[1];
    let textWidth = hoverText.node().getBoundingClientRect().width;
    let textHeight = hoverText.node().getBoundingClientRect().height;
    let svgContainerWidth = svgContainer.node().getBoundingClientRect().width;
    let svgContainerHeight = svgContainer.node().getBoundingClientRect().height;
    if (me.textProps.posFree) {
      svgContainer.node().style.overflow = "visible";
    }
    //超过容器则修正位置
    if (!me.textProps.posFree && textWidth + x + 10 > svgContainerWidth) {
      x = svgContainerWidth - textWidth - me.padding.right;
    }
    if (!me.textProps.posFree && textHeight + y + 5 > svgContainerHeight) {
      y = svgContainerHeight - textHeight - 5;
    }
    hoverText
      .style({
        visibility: "visible",
        top: y + 5 + "px",
        left: x + 10 + "px"
      });
  }

  //鼠标离开隐藏数据
  _hideHoverText() {
    let me = this;
    let svgContainer = d3.select(me.element).select(".svg-container");
    let hoverText = svgContainer.selectAll(".hover-text");
    if (hoverText[0].length > 0) {
      hoverText.style({ "visibility": "hidden" });
    }
  }

  //注册事件
  _eventRegister(ele, config, eleType) {
    let me = this;
    let type = me.config[0].type;
    //注册点击事件
    if (config.onClick) {
      ele.on("click", (d, i) => {
        clearTimeout(this.clickTimer);
        this.clickTimer = setTimeout(() => {
          config.onClick({
            value: d,
            index: i
          });
        }, 300);
      });
    }

    //注册双击事件
    if (config.onDbClick) {
      ele.on("dblclick", (d, i) => {
        clearTimeout(this.clickTimer);
        config.onDbClick({
          value: d,
          index: i
        });
      });
    }

    //添加动画
    if (eleType === "circle" && config.pinch) {
      ele.attr("class", ele.attr("class") + " point-pinch");
    }
    //注册鼠标悬浮事件
    if (config.onMouseover || config.pinch) {
      ele.on("mouseover", function (d, i) {
        //动画效果
        if (eleType === "circle" && config.pinch) {
          if (!(this.getAttribute("selected") === "true")) {
            let orgR = d3.select(this).attr("r");
            d3.select(this).attr("r", Number.parseFloat(orgR) + 2);
          }
        }
        if (config.onMouseover) {
          config.onMouseover({
            value: d,
            index: i
          });
        }
      });
    }
    //注册鼠标离开事件
    if (config.onMouseout || config.pinch
      || ((type === "scatter" || type === "map-scatter" || type === "relation")
        && me.hoverText)) {

      ele.on("mouseout", function (d, i) {
        //动画效果
        if (eleType === "circle" && config.pinch) {
          if (!(this.getAttribute("selected") === "true")) {
            let orgR = d3.select(this).attr("r");
            d3.select(this).attr("r", Number.parseFloat(orgR) - 2);
          }
        }

        //悬浮提示
        if ((type === "scatter" || type === "map-scatter" || type === "relation")
          && me.hoverText) {
          me._hideHoverText();
        }
        if (config.onMouseout) {
          config.onMouseout({
            value: d,
            index: i
          });
        }
      });
    }

    //注册鼠标移动事件
    if (config.onMousemove
      || ((type === "scatter" || type === "map-scatter" || type === "relation")
        && me.hoverText)) {
      ele.on("mousemove", function (d, i) {
        //悬浮提示
        if ((type === "scatter" || type === "map-scatter" || type === "relation")
          && me.hoverText) {
          me._showHoverText(d);
        }

        if (config.onMousemove) {
          config.onMousemove({
            value: d,
            index: i
          });
        }
      });
    }
  }

  //抛出异常
  _exception(content) {
    throw content;
  }
}

export default BCharts;
