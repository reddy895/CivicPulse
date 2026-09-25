// SPDX-License-Identifier: AGPL-3.0-or-later OR Apache-2.0
// Copyright (c) 2026 Praveen Reddy. All rights reserved.
// CivicPulse DPG - Multilingual AI Citizen Infrastructure Alignment Platform

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import 'leaflet/dist/leaflet.css';
import './i18n/index.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
