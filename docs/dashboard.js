var chartDom = document.getElementById('chart');
var areaChartDom = document.getElementById('chartArea');

var chart = echarts.init(chartDom);
var areaChart = echarts.init(areaChartDom);
var option, areaOption, data;

option = {
  grid: {
      top:10,
      left:285
  },
  tooltip: {
      trigger: 'axis',
      axisPointer: {
          type: 'shadow'
      }
  },
  xAxis: {
    type: 'value'
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

areaOption = JSON.parse(JSON.stringify(option));

async function setData(targetDate) {

  let result = await fetch(`/data/${targetDate}.json`)
    .then(response => response.text())
    .then(data => data);

  data = JSON.parse(result);

  option.yAxis.data = data.map(obj => {return obj.name});
  option.series[0].data = data?.map(obj => {return obj.value});

  let areaData = new Map();
  for (const v of data) {

    if (areaData.has(v.area)) {

      areaData.set(v.area, areaData.get(v.area) + v.value);
    } else {
      areaData.set(v.area, v.value);
    }
  }

  areaOption.yAxis.data = Array.from(areaData.entries()).map(obj => { return obj[0] });
  areaOption.series[0].data = Array.from(areaData.entries()).map(obj => { return obj[1] });

  option && chart.setOption(option);
  areaOption && areaChart.setOption(areaOption);

  var dataDom = document.getElementById('date');
  dataDom.textContent = `${targetDate}時点`;

  document.getElementById('sidebarMenu').classList.remove("show");
};

var itemDom = document.getElementsByClassName('item');
setData(itemDom[0].text);

window.addEventListener("orientationchange", function() {
  setTimeout(() => {
    chart.resize();
    areaChart.resize();
  }, 300);
});