import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import Layout from '@/components/Layout';
import Overview from '@/pages/Overview';
import LiveMonitoring from '@/pages/LiveMonitoring';
import WaterQualityMap from '@/pages/WaterQualityMap';
import BoatMonitoring from '@/pages/BoatMonitoring';
import Treatment from '@/pages/Treatment';
import Alerts from '@/pages/Alerts';
import HistoricalData from '@/pages/HistoricalData';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import Presentation from '@/presentation/Presentation';

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/presentation" element={<Presentation />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Overview />} />
            <Route path="live" element={<LiveMonitoring />} />
            <Route path="map" element={<WaterQualityMap />} />
            <Route path="boat" element={<BoatMonitoring />} />
            <Route path="treatment" element={<Treatment />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="historical" element={<HistoricalData />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;
