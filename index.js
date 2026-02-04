import axios from "axios";
import fs from "fs";

let symbols = JSON.parse(fs.readFileSync("./stocks.json"));

const sleep = (milliseconds) => {
   return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

function getTotalPercentage(data) {
   if (!data) return 0;
   let total = 0;
   Object.entries(data).forEach(([key, value]) => {
      if (key === "percent" && Object.keys(data).length === 1) total += value;
      else total += value.percent;
   });
   return total;
}

function getShareHoldingPatters(data) {
   const arr = Object.entries(data);
   const latest_patterns = arr[arr.length - 1][1];

   return {
      promoters: getTotalPercentage(latest_patterns.promoters),
      mutualFunds: getTotalPercentage(latest_patterns.mutualFunds),
      otherDomesticInstitutions: getTotalPercentage(
         latest_patterns.otherDomesticInstitutions
      ),
      foreignInstitutions: getTotalPercentage(
         latest_patterns.foreignInstitutions
      ),
      retailAndOthers: getTotalPercentage(latest_patterns.retailAndOthers),
   };
}

function getFinancialStatement(data) {
   let profit = [0, 0, 0, 0, 0];
   let revenue = [0, 0, 0, 0, 0];
   let netWorth = [0, 0, 0, 0, 0];

   data.forEach(({ title, yearly, _ }) => {
      if (title === "Revenue" && yearly) {
         revenue.push(...Object.values(yearly));
      } else if (title === "Profit" && yearly) {
         profit.push(...Object.values(yearly));
      } else if (title === "Net Worth" && yearly) {
         netWorth.push(...Object.values(yearly));
      }
   });

   return {
      profit: profit.slice(-5, profit.length),
      revenue: profit.slice(-5, revenue.length),
      netWorth: profit.slice(-5, netWorth.length),
   };
}

const getStockCandleStickData = async (type, company_code) => {
   const chart_response_1D = await axios.get(
      "https://groww.in/v1/api/charting_service/v2/chart/exchange/" +
         type +
         "/segment/CASH/" +
         company_code +
         "/daily?intervalInMinutes=5"
   );
   const chart_response_1W = await axios.get(
      "https://groww.in/v1/api/charting_service/v2/chart/exchange/" +
         type +
         "/segment/CASH/" +
         company_code +
         "/weekly?intervalInMinutes=30"
   );
   const chart_response_1M = await axios.get(
      "https://groww.in/v1/api/charting_service/v2/chart/exchange/" +
         type +
         "/segment/CASH/" +
         company_code +
         "/monthly?intervalInMinutes=120"
   );
   const chart_response_1Y = await axios.get(
      "https://groww.in/v1/api/charting_service/v2/chart/exchange/" +
         type +
         "/segment/CASH/" +
         company_code +
         "/1y?intervalInDays=3"
   );
   const chart_response_3Y = await axios.get(
      "https://groww.in/v1/api/charting_service/v2/chart/exchange/" +
         type +
         "/segment/CASH/" +
         company_code +
         "/3y?intervalInDays=15"
   );
   const chart_response_5Y = await axios.get(
      "https://groww.in/v1/api/charting_service/v2/chart/exchange/" +
         type +
         "/segment/CASH/" +
         company_code +
         "/5y?intervalInDays=25"
   );

   function processChartData(data) {
      const price_graph = [];
      data.candles.forEach(([_, ...price]) => {
         price_graph.push(price);
      });
      return price_graph;
   }

   const chart_data_1D = chart_response_1D.data;
   const chart_data_1W = chart_response_1W.data;
   const chart_data_1M = chart_response_1M.data;
   const chart_data_1Y = chart_response_1Y.data;
   const chart_data_3Y = chart_response_3Y.data;
   const chart_data_5Y = chart_response_5Y.data;
   const beginTime = new Date(chart_data_1D.candles[0][0] * 1000);

   return {
      timeStamp: beginTime.getTime() / 1000,
      price_graph_1D: processChartData(chart_data_1D),
      price_graph_1W: processChartData(chart_data_1W),
      price_graph_1M: processChartData(chart_data_1M),
      price_graph_1Y: processChartData(chart_data_1Y),
      price_graph_3Y: processChartData(chart_data_3Y),
      price_graph_5Y: processChartData(chart_data_5Y),
   };
};

const getStockData = async (type, company_code, search_id) => {
   const chart_response_1D = await axios.get(
      "https://groww.in/v1/api/charting_service/v2/chart/exchange/" +
         type +
         "/segment/CASH/" +
         company_code +
         "/daily?intervalInMinutes=1&minimal=true"
   );
   const chart_response_1W = await axios.get(
      "https://groww.in/v1/api/charting_service/v2/chart/exchange/" +
         type +
         "/segment/CASH/" +
         company_code +
         "/weekly?intervalInMinutes=5&minimal=true"
   );
   const chart_response_1M = await axios.get(
      "https://groww.in/v1/api/charting_service/v2/chart/exchange/" +
         type +
         "/segment/CASH/" +
         company_code +
         "/monthly?intervalInMinutes=30&minimal=true"
   );
   const chart_response_1Y = await axios.get(
      "https://groww.in/v1/api/charting_service/v2/chart/exchange/" +
         type +
         "/segment/CASH/" +
         company_code +
         "/1y?intervalInDays=1&minimal=true"
   );
   const chart_response_3Y = await axios.get(
      "https://groww.in/v1/api/charting_service/v2/chart/exchange/" +
         type +
         "/segment/CASH/" +
         company_code +
         "/3y?intervalInDays=3&minimal=true"
   );
   const chart_response_5Y = await axios.get(
      "https://groww.in/v1/api/charting_service/v2/chart/exchange/" +
         type +
         "/segment/CASH/" +
         company_code +
         "/5y?intervalInDays=5&minimal=true"
   );
   const latest_response = await axios.get(
      "https://groww.in/v1/api/stocks_data/v1/tr_live_prices/exchange/" +
         type +
         "/segment/CASH/" +
         company_code +
         "/latest"
   );
   const fundamental_response = await axios.get(
      "https://groww.in/v1/api/stocks_data/v1/company/search_id/" +
         search_id +
         "?page=0&size=10"
   );

   function processChartData(data) {
      const price_graph = [];
      data.candles.forEach(([_, price]) => {
         price_graph.push(price);
      });
      return price_graph;
   }

   const chart_data_1D = chart_response_1D.data;
   const chart_data_1W = chart_response_1W.data;
   const chart_data_1M = chart_response_1M.data;
   const chart_data_1Y = chart_response_1Y.data;
   const chart_data_3Y = chart_response_3Y.data;
   const chart_data_5Y = chart_response_5Y.data;
   const latest_data = latest_response.data;
   const fundamental_data = fundamental_response.data;
   const beginTime = new Date(chart_data_1D.candles[0][0] * 1000);

   return {
      timeStamp: beginTime.getTime() / 1000,
      price_graph_1D: processChartData(chart_data_1D),
      price_graph_1W: processChartData(chart_data_1W),
      price_graph_1M: processChartData(chart_data_1M),
      price_graph_1Y: processChartData(chart_data_1Y),
      price_graph_3Y: processChartData(chart_data_3Y),
      price_graph_5Y: processChartData(chart_data_5Y),
      open: latest_data.open,
      close: latest_data.close,
      low: latest_data.low,
      high: latest_data.high,
      highPriceRange: latest_data.highPriceRange,
      lowPriceRange: latest_data.lowPriceRange,
      marketCap: fundamental_data.stats.marketCap,
      pbRatio: fundamental_data.stats.pbRatio,
      peRatio: fundamental_data.stats.peRatio,
      divYield: fundamental_data.stats.dividendYieldInPercent,
      bookValue: fundamental_data.stats.bookValue,
      epsTtm: fundamental_data.stats.epsTtm,
      roe: fundamental_data.stats.roe,
      industryPe: fundamental_data.stats.industryPe,
      faceValue: fundamental_data.stats.faceValue,
      debtToEquity: fundamental_data.stats.debtToEquity,
      ...getShareHoldingPatters(fundamental_data.shareHoldingPattern),
      ...getFinancialStatement(fundamental_data.financialStatement),
   };
};

function appendDataToFile(data, parentFolder, folder, file) {
   function createFolderIfNotExists(dir) {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
   }
   const folderPath = parentFolder + "/" + folder;
   const path = parentFolder + "/" + folder + "/" + file + ".json";

   createFolderIfNotExists(folderPath);
   let file_data = [];
   try {
      file_data = JSON.parse(fs.readFileSync(path));
   } catch (err) {
      file_data = [];
   }

   file_data.push(data);

   fs.writeFileSync(path, JSON.stringify(file_data));
   console.log("Updated " + parentFolder + "/" + folder + "/" + file + ".json");
}

async function updateStockList() {
   let all_stocks = [];
   symbols.forEach(({ _, stocks }) => {
      all_stocks.push(...stocks);
   });

   function getCompanyData(data) {
      const company_data = [];
      data.forEach(({ company }) => {
         const code = company.nseScriptCode;
         if (!all_stocks.some((stock) => stock.search_id === company.searchId))
            company_data.push({
               company_code: code === undefined ? company.bseScriptCode : code,
               search_id: company.searchId,
               type: code === undefined ? "BSE" : undefined,
            });
      });
      return company_data;
   }

   async function fetchAndProcessStocks(url, type) {
      const data = (await axios.get(url)).data;
      if (type === "TOP_LOSERS" || type === "TOP_GAINERS") {
         return getCompanyData(data.categoryResponseMap[type].items);
      } else {
         return {
            most_bought: getCompanyData(
               data.exploreCompanies["POPULAR_STOCKS_MOST_BOUGHT"]
            ),
            most_valuable: getCompanyData(
               data.exploreCompanies["MOST_VALUABLE"]
            ),
            in_news: getCompanyData(data.exploreCompanies["STOCKS_IN_NEWS"]),
         };
      }
   }

   function updateStocksJSON(type, data) {
      for (let i = 0; i < symbols.length; i++) {
         const stockGrp = symbols[i].stocks;
         if (symbols[i].type === type) {
            stockGrp.push(...data);

            const ids = stockGrp.map((o) => o.company_code);
            const filtered = stockGrp.filter(
               ({ company_code }, index) =>
                  !ids.includes(company_code, index + 1)
            );
            symbols[i].stocks = [...filtered];
            break;
         }
      }
      fs.writeFileSync("./stocks.json", JSON.stringify(symbols));
   }

   const top_gainers_large = await fetchAndProcessStocks(
      "https://groww.in/v1/api/stocks_data/explore/v2/indices/GIDXNIFTY100/market_trends?discovery_filter_types=TOP_GAINERS&size=10",
      "TOP_GAINERS"
   );
   updateStocksJSON("Once-Top-Gainers-Large", top_gainers_large);
   const top_gainers_mid = await fetchAndProcessStocks(
      "https://groww.in/v1/api/stocks_data/explore/v2/indices/GIDXNIFMDCP100/market_trends?discovery_filter_types=TOP_GAINERS&size=10",
      "TOP_GAINERS"
   );
   updateStocksJSON("Once-Top-Gainers-Mid", top_gainers_mid);
   const top_gainers_small = await fetchAndProcessStocks(
      "https://groww.in/v1/api/stocks_data/explore/v2/indices/GIDXNIFSMCP100/market_trends?discovery_filter_types=TOP_GAINERS&size=10",
      "TOP_GAINERS"
   );
   updateStocksJSON("Once-Top-Gainers-Small", top_gainers_small);
   const top_losers_large = await fetchAndProcessStocks(
      "https://groww.in/v1/api/stocks_data/explore/v2/indices/GIDXNIFTY100/market_trends?discovery_filter_types=TOP_LOSERS&size=10",
      "TOP_LOSERS"
   );
   updateStocksJSON("Once-Top-Losers-Large", top_losers_large);
   const top_losers_mid = await fetchAndProcessStocks(
      "https://groww.in/v1/api/stocks_data/explore/v2/indices/GIDXNIFMDCP100/market_trends?discovery_filter_types=TOP_LOSERS&size=10",
      "TOP_LOSERS"
   );
   updateStocksJSON("Once-Top-Losers-Mid", top_losers_mid);
   const top_losers_small = await fetchAndProcessStocks(
      "https://groww.in/v1/api/stocks_data/explore/v2/indices/GIDXNIFSMCP100/market_trends?discovery_filter_types=TOP_LOSERS&size=10",
      "TOP_LOSERS"
   );
   updateStocksJSON("Once-Top-Losers-Small", top_losers_small);
   const popular = await fetchAndProcessStocks(
      "https://groww.in/v1/api/stocks_data/v2/explore/list/top?discoveryFilterTypes=STOCKS_IN_NEWS%2CMOST_VALUABLE%2CPOPULAR_STOCKS_MOST_BOUGHT&page=0&size=10",
      "POPULAR"
   );
   updateStocksJSON("Once-Most-Bought", popular.most_valuable);
   updateStocksJSON("Once-Most-Valuable", popular.most_valuable);
   updateStocksJSON("Once-In-News", popular.in_news);
}

async function getAndUpdateStockData() {
   let c = 0;
   let k = 0;

   for (let i = 0; i < symbols.length; i++) {
      const { type, stocks } = symbols[i];
      for (let j = 0; j < stocks.length; j++) {
         const { exchange_type, company_code, search_id } = stocks[j];
         let company_data = {};
         let company_candle_stick_data = {};
         try {
            company_data = await getStockData(
               exchange_type === undefined ? "NSE" : exchange_type,
               company_code,
               search_id
            );
            company_candle_stick_data = await getStockCandleStickData(
               exchange_type === undefined ? "NSE" : exchange_type,
               company_code
            );
            k = 0;
         } catch (err) {
            if (k > 5) {
               j++;
               k = -1;
            }
            j--;
            k++;
            await sleep((30 + Math.random() * 30) * 1000);
            continue;
         }

         process.stdout.write(++c + ". ");
         appendDataToFile(company_data, "./data", type, company_code);
         process.stdout.write(c + ". ");
         appendDataToFile(
            { ...company_data, ...company_candle_stick_data },
            "./candle-stick-data",
            type,
            company_code
         );
         await sleep((1 + Math.random() * 2) * 1000);
      }
   }
}

(async () => {
   await updateStockList();
   console.log("Updated stock list!");

   let total_number_of_stocks = 0;
   symbols.forEach(({ stocks }) => (total_number_of_stocks += stocks.length));
   console.log("Number of stocks to be fetched: ", total_number_of_stocks);

   await getAndUpdateStockData();

   console.log("Updation finished!");
})();
