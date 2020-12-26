import { Line } from 'react-chartjs-2'
import { useEffect, useState } from 'react';
import numeral from 'numeral';

const options = {
  legend: {                    /*      Default          */
    display: false,
  },
  elements: {
    point: {
      radius: 0,
    },
  },                         
  maintainAspectRatio: false,
  tooltips: {       // show value when we hover on graph
    mode: "index",
    intersect: false,
    callbacks: {
      label: function (tooltipItem, data) {
        return numeral(tooltipItem.value).format("+0,0");
      },
    },
  },                                /*      Default          */ 
  scales: {
    xAxes: [
      {
        type: "time",
        time: {
          format: "MM/DD/YY",
          tooltipFormat: "ll",
        }
      }
    ],
    yAxes: [
      {
        gridLines: {
          display: false,
        },
        ticks: {
          // Include a dollar sign in the ticks
          callback: function (value, index, values) {
            return numeral(value).format("0a");
          }
        }
      }
    ]
  }
};

const buildChartData = (data, casesType) => {
    const chartData = [];
    let lastDataPoint;
    for (let date in data[casesType]) {
        if (lastDataPoint) {
            let newDataPoint = {
                x: date,
                y: data[casesType][date] - lastDataPoint,
            };
            chartData.push(newDataPoint);
        }
        lastDataPoint = data[casesType][date];
    }
    return chartData;
};

function LineGraph({ casesType }) {
    const [data, setData] = useState({});

    useEffect(() => {
        fetch('https://disease.sh/v3/covid-19/historical/all?lastdays=128')
            .then(res => res.json())
            .then(data => {
                const chartData = buildChartData(data, casesType);
                setData(chartData);
            })
    }, [casesType]);

    return (
        <div>
            {data?.length > 0 && (
                <Line
                    data={{
                        datasets: [
                        {
                            backgroundColor: "rgba(204, 16, 52, 0.5)",
                            borderColor: "#CC1034",
                            data: data,
                        }
                        ],
                    }}
                    options={options}
                />
            )}
        </div>
    )
}

export default LineGraph;
