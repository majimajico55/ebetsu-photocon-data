var chartDom = document.getElementById('chart');
var areaChartDom = document.getElementById('chartArea');
var heatMapDom = document.getElementById('heatMap');

var chart = echarts.init(chartDom);
var areaChart = echarts.init(areaChartDom);
var heatMap = echarts.init(heatMapDom);
var option, option4HeatMap, areaOption, data;

option = {
  grid: {
      top:10,
      left:285,
      bottom:40
  },
  tooltip: {
      trigger: 'axis',
      axisPointer: {
          type: 'shadow'
      }
  },
  xAxis: {
    type: 'value',
    max: 60
  },
  yAxis: {
    type: 'category',
    data: null,
    axisLabel: {
        interval: 0
    }
  },
  series: [{
      data: null,
      type: 'bar',
      label: {
          show: true,
          position: 'right'
      }

  }]
};

option4HeatMap = {
  animation: false,
  tooltip: {
      trigger: 'item'
  },
  leaflet: {
    center: [141.53599253908973, 43.103994672633654],
    zoom: 12,
    roam: true
  },
  visualMap: {
      show: false,
      top: 'top',
      min: 0,
      max: 1,
      seriesIndex: 0,
      calculable: true,
      inRange: {
          color: ['blue', 'blue', 'green', 'yellow', 'red']
      }
  },
  series: [{
      type: 'heatmap',
      coordinateSystem: 'leaflet',
      data: [],
      pointSize: 30,
      blurSize: 25
  },
  {
      type: 'scatter',
      coordinateSystem: 'leaflet',
      data: [],
      symbol: 'image://data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7',
      tooltip: {
        formatter: function(data) {
          return `【${data.name}】 ${data.value[2]} 投稿`
        },
        show: true
      },
      symbolSize: 10
  }]  
};

areaOption = JSON.parse(JSON.stringify(option));

async function setData(targetDate) {

  let result = await fetch(`./data/${targetDate}.json`)
    .then(response => response.text())
    .then(data => data);

  data = JSON.parse(result);

  option.yAxis.data = data.map(obj => {return obj.name});
  option.series[0].data = data?.map(obj => {return obj.value});

  if (window.screen.width < 576) {
    option.grid.left = 100;

    option.yAxis.axisLabel.width = 90;
    option.yAxis.axisLabel.overflow = 'truncate';
  }

  let areaData = new Map();
  for (const v of data) {

    if (areaData.has(v.area)) {

      areaData.set(v.area, areaData.get(v.area) + v.value);
    } else {
      areaData.set(v.area, v.value);
    }
  }

  areaOption.grid.left = 120;
  areaOption.xAxis.max = 400;
  areaOption.yAxis.data = Array.from(areaData.entries()).map(obj => { return obj[0] });
  areaOption.series[0].data = Array.from(areaData.entries()).map(obj => { return obj[1] });

  option && chart.setOption(option);
  areaOption && areaChart.setOption(areaOption);

  var dataDom = document.getElementById('date');
  dataDom.textContent = `${targetDate} 時点の投稿状況`;

  document.getElementById('sidebarMenu').classList.remove("show");

  var points = [].concat.apply(data.map(function (item) {
    return {name: item.name, value: [item.lon, item.lat, item.value]}
  }));
  option4HeatMap.series[0].data = points;
  option4HeatMap.series[1].data = points;
  option4HeatMap.visualMap.max = Math.max(...[].concat.apply(data.map(function (item) {
    return parseInt(item.value)
  }))) * 0.8;

  option4HeatMap && heatMap.setOption(option4HeatMap);

};

var itemDom = document.getElementsByClassName('item');
setData(itemDom[0].text);

window.addEventListener("orientationchange", function() {
  setTimeout(() => {
    chart.resize();
    areaChart.resize();
  }, 300);
});