import './App.css';
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
} from "@material-ui/core";
import { useEffect, useState } from 'react';
import InfoBox from './component/InfoBox/InfoBox';
import Map from './component/Map/Map'
import Table from './component/Table/Table';
import LineGraph from './component/LineGraph/LineGraph';
import { prettyPrintStat, sortData } from './utils/util';
import numeral from "numeral";
import "leaflet/dist/leaflet.css";
import image from './image/image.png'

function App() {
  const [countries, setCountries] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [countryInfo, setCountryInfo] = useState({});
  const [country, setInputCountry] = useState("worldwide");
  const [casesType, setCasesType] = useState("cases");
  const [mapCountries, setMapCountries] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 20, lng: 77 });
  const [mapZoom, setMapZoom] = useState(3);

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  useEffect(() => {
    // async -> send a request, wait for it, do something with info
     
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
              .then(response => response.json())
              .then(data => {
                const countries = data.map(country => ({
                  name: country.country,
                  values: country.countryInfo.iso2 // UK, USA, IN
                }));
                let sortedData = sortData(data);
                setTableData(sortedData);
                setMapCountries(data);
                setCountries(countries);
              })
    }

    getCountriesData();
  }, [])

  const onCountryChange = async (e) => {
    const countryCode = e.target.value;

    const url = countryCode === "worldwide" ? "https://disease.sh/v3/covid-19/all" : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
            .then(res => res.json())
            .then(data => {
              setInputCountry(countryCode)
              setCountryInfo(data);
              setMapCenter([data.countryInfo?.lat, data.countryInfo?.long]);
              setMapZoom(4);
            })
  }
  

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <img src={image} alt="COVID-19"/>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={onCountryChange}
            >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.values}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
          <InfoBox
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            isRed
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")}
          />
        </div>
        <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <div className="app__information">
            <h3>Live Cases by Country</h3>
            <Table countries={tableData} />
            <h3>Worldwide new {casesType}</h3>
            <LineGraph casesType={casesType} />
          </div>
        </CardContent>  
      </Card>

    </div>
  );
}

export default App;
