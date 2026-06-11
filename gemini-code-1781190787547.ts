import React, { useState, useEffect } from 'react';

// Mock Pricing configuration (Adjust rates as needed)
const SUBSTANCES = [
  { id: 'sub_1', name: 'Standard Eco (Základní)', pricePerM2: 0 },
  { id: 'sub_2', name: 'Deep Premium (Hloubkové)', pricePerM2: 45 },
  { id: 'sub_3', name: 'Anti-Allergen (Proti alergenům)', pricePerM2: 60 },
  { id: 'sub_4', name: 'Pet Odor Remover (Zvířecí pachy)', pricePerM2: 75 },
  { id: 'sub_5', name: 'Ultra Protection Silk (Jemné textilie)', pricePerM2: 90 },
];

export default function PriceCalculator() {
  // Calculator inputs
  const [area, setArea] = useState<number>(10);
  const [cycles, setCycles] = useState<number>(1);
  const [selectedSubstance, setSelectedSubstance] = useState<string>('sub_1');
  const [safeOption, setSafeOption] = useState<boolean>(false);
  const [isVatPayer, setIsVatPayer] = useState<boolean>(false);

  // Czech Invoice Specifics
  const [invoiceNumber, setInvoiceNumber] = useState<string>('20260001');
  const [variableSymbol, setVariableSymbol] = useState<string>('20260001');
  const [supplier, setSupplier] = useState({ name: 'CleanTextil s.r.o.', address: 'Pražská 123, Praha', ico: '12345678', dic: 'CZ12345678' });
  const [customer, setCustomer] = useState({ name: '', address: '', ico: '', dic: '' });

  // Base configurations
  const basePricePerM2 = 120; // Base cleaning cost per m²
  const safeOptionFlatFee = 500; // Safe option surcharge

  // Calculation Logic
  const substancePrice = SUBSTANCES.find(s => s.id === selectedSubstance)?.pricePerM2 || 0;
  const pricePerUnit = basePricePerM2 + substancePrice;
  const subtotalItems = pricePerUnit * area * cycles;
  const finalSubtotal = subtotalItems + (safeOption ? safeOptionFlatFee : 0);
  
  const vatAmount = isVatPayer ? finalSubtotal * 0.21 : 0;
  const totalWithVat = finalSubtotal + vatAmount;

  // Auto-load/save draft functionality
  useEffect(() => {
    const savedData = localStorage.getItem('clean_calc_draft');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setCustomer(parsed.customer || { name: '', address: '', ico: '', dic: '' });
    }
  }, []);

  const saveDraft = () => {
    localStorage.setItem('clean_calc_draft', JSON.stringify({ customer }));
    alert('Zákaznická data bezpečně uložena do prohlížeče.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 grid grid-cols-1 xl:grid-cols-3 gap-8 text-gray-800">
      
      {/* LEFT COLUMN: CONTROL PANEL (Hidden during print) */}
      <div className="xl:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 print:hidden space-y-6 self-start">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-1">Kalkulačka Čištění</h2>
          <p className="text-sm text-gray-500">Nastavení parametrů zakázky a fakturačních údajů.</p>
        </div>

        <hr className="border-gray-200" />

        {/* Core Metrics */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Plocha k čištění (m²)</label>
            <input 
              type="number" 
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={area} 
              onChange={(e) => setArea(Math.max(0, Number(e.target.value)))} 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Počet cyklů / Opakování</label>
            <input 
              type="number" 
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={cycles} 
              onChange={(e) => setCycles(Math.max(1, Number(e.target.value)))} 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Typ čistící látky / chemie</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={selectedSubstance}
              onChange={(e) => setSelectedSubstance(e.target.value)}
            >
              {SUBSTANCES.map(s => (
                <option key={s.id} value={s.id}>{s.name} (+{s.pricePerM2} Kč/m²)</option>
              ))}
            </select>
          </div>

          {/* Safe Option Checkbox */}
          <div className="flex items-start p-3 bg-blue-50 rounded-xl border border-blue-200">
            <input 
              type="checkbox" 
              id="safeOption" 
              className="mt-1 mr-3 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
              checked={safeOption} 
              onChange={(e) => setSafeOption(e.target.checked)} 
            />
            <label htmlFor="safeOption" className="text-sm text-blue-900">
              <span className="font-bold block">Safe Option (+500 Kč)</span>
              Připojištění rizikových textilií, záruka nepoškození a šetrný ekologický postup.
            </label>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Customer Data */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Odběratel (Zákazník)</h3>
          <input 
            type="text" placeholder="Název firmy / Jméno" 
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            value={customer.name} onChange={(e) => setCustomer({...customer, name: e.target.value})}
          />
          <input 
            type="text" placeholder="Adresa" 
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            value={customer.address} onChange={(e) => setCustomer({...customer, address: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="text" placeholder="IČO" 
              className="p-2 border border-gray-300 rounded-lg text-sm"
              value={customer.ico} onChange={(e) => setCustomer({...customer, ico: e.target.value})}
            />
            <input 
              type="text" placeholder="DIČ" 
              className="p-2 border border-gray-300 rounded-lg text-sm"
              value={customer.dic} onChange={(e) => setCustomer({...customer, dic: e.target.value})}
            />
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-sm">
            <label className="font-medium text-gray-700">Plátce DPH (21%)</label>
            <input 
              type="checkbox" 
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
              checked={isVatPayer} 
              onChange={(e) => setIsVatPayer(e.target.checked)} 
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Číslo faktury</label>
              <input type="text" className="w-full p-1.5 border rounded text-xs" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Var. symbol</label>
              <input type="text" className="w-full p-1.5 border rounded text-xs" value={variableSymbol} onChange={e => setVariableSymbol(e.target.value)} />
            </div>
          </div>
        </div>

        {/* System Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button onClick={saveDraft} className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-300 transition">
            Uložit koncept
          </button>
          <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm transition">
            Tisk / Export PDF
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: PREBUILT CZECH INVOICE PREVIEW */}
      <div className="xl:col-span-2 bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200 print:border-0 print:shadow-none print:p-0 min-h-[297mm] w-full max-w-[210mm] mx-auto flex flex-col justify-between font-sans text-sm">
        
        {/* Invoice Header */}
        <div>
          <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-light text-gray-900 tracking-tight">FAKTURA – Daňový doklad</h1>
              <p className="text-sm text-gray-500 mt-1">Číslo dokladu / Invoice No.: <span className="font-semibold text-gray-800">{invoiceNumber}</span></p>
            </div>
            <div className="text-right text-xs text-gray-500 space-y-1">
              <p>Variabilní symbol: <span className="font-bold text-gray-950 text-sm">{variableSymbol}</span></p>
              <p>Konstantní symbol: 0308</p>
            </div>
          </div>

          {/* Supplier & Customer Block */}
          <div className="grid grid-cols-2 gap-8 border border-gray-200 rounded-xl p-4 mb-6 bg-gray-50/50">
            {/* Supplier */}
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Dodavatel</h3>
              <p className="font-bold text-gray-900">{supplier.name}</p>
              <p className="text-gray-600 whitespace-pre-line text-xs">{supplier.address}</p>
              <div className="pt-2 text-xs space-y-0.5">
                <p><span className="text-gray-400">IČO:</span> {supplier.ico}</p>
                {supplier.dic && <p><span className="text-gray-400">DIČ:</span> {supplier.dic}</p>}
              </div>
            </div>

            {/* Customer */}
            <div className="space-y-1 border-l border-gray-200 pl-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Odběratel</h3>
              {customer.name ? (
                <>
                  <p className="font-bold text-gray-900">{customer.name}</p>
                  <p className="text-gray-600 text-xs">{customer.address || 'Adresa neuvedena'}</p>
                  <div className="pt-2 text-xs space-y-0.5">
                    {customer.ico && <p><span className="text-gray-400">IČO:</span> {customer.ico}</p>}
                    {customer.dic && <p><span className="text-gray-400">DIČ:</span> {customer.dic}</p>}
                  </div>
                </>
              ) : (
                <p className="text-gray-400 italic text-xs pt-2">Vyplňte údaje odběratele v levém panelu...</p>
              )}
            </div>
          </div>

          {/* Dates Mapping */}
          <div className="grid grid-cols-3 gap-4 border-b border-gray-200 pb-4 mb-6 text-xs text-gray-600">
            <div>
              <span className="block text-gray-400">Datum vystavení:</span>
              <span className="font-medium text-gray-900">{new Date().toLocaleDateString('cs-CZ')}</span>
            </div>
            <div>
              <span className="block text-gray-400">Datum splatnosti (14 dní):</span>
              <span className="font-medium text-gray-900">
                {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('cs-CZ')}
              </span>
            </div>
            <div>
              <span className="block text-gray-400">Datum uskutečnění plnění (DUZP):</span>
              <span className="font-medium text-gray-900">{new Date().toLocaleDateString('cs-CZ')}</span>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left border-collapse mb-8 text-xs">
            <thead>
              <tr className="border-b border-gray-300 text-gray-400 uppercase tracking-wider text-[10px]">
                <th className="py-2 font-semibold">Popis položky</th>
                <th className="py-2 text-right font-semibold">Množství</th>
                <th className="py-2 text-right font-semibold">Cena/jedn.</th>
                <th className="py-2 text-right font-semibold">Sazba</th>
                <th className="py-2 text-right font-semibold">Celkem bez DPH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {/* Line 1: Main Cleaning Job */}
              <tr>
                <td className="py-3 font-medium text-gray-900">
                  Čištění textilních povrchů (plocha: {area} m², {cycles}x cyklus)<br/>
                  <span className="text-[11px] text-gray-400 font-normal">Zvolená chemie: {SUBSTANCES.find(s => s.id === selectedSubstance)?.name}</span>
                </td>
                <td className="py-3 text-right">{area * cycles} m²</td>
                <td className="py-3 text-right">{pricePerUnit} Kč</td>
                <td className="py-3 text-right">{isVatPayer ? '21%' : '0%'}</td>
                <td className="py-3 text-right">{(pricePerUnit * area * cycles).toLocaleString('cs-CZ')} Kč</td>
              </tr>

              {/* Line 2: Safe Option if active */}
              {safeOption && (
                <tr>
                  <td className="py-3 font-medium text-gray-900">
                    Safe Option<br/>
                    <span className="text-[11px] text-gray-400 font-normal">Fixní příplatek za bezpečné ošetření a záruku</span>
                  </td>
                  <td className="py-3 text-right">1 ks</td>
                  <td className="py-3 text-right">{safeOptionFlatFee} Kč</td>
                  <td className="py-3 text-right">{isVatPayer ? '21%' : '0%'}</td>
                  <td className="py-3 text-right">{safeOptionFlatFee.toLocaleString('cs-CZ')} Kč</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pricing Totals Section */}
        <div className="border-t border-gray-200 pt-4 mt-auto">
          <div className="w-1/2 ml-auto space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Základ daně (Celkem bez DPH):</span>
              <span>{finalSubtotal.toLocaleString('cs-CZ')} Kč</span>
            </div>
            {isVatPayer && (
              <div className="flex justify-between text-gray-500">
                <span>DPH vyčíslené (21%):</span>
                <span>{vatAmount.toLocaleString('cs-CZ')} Kč</span>
              </div>
            )}
            <div className="flex justify-between border-t-2 border-gray-900 pt-2 text-base font-bold text-gray-900">
              <span>Celkem k úhradě:</span>
              <span>{totalWithVat.toLocaleString('cs-CZ')} Kč</span>
            </div>
          </div>

          {/* Legal Non-Payer Notice if applicable */}
          {!isVatPayer && (
            <p className="text-[11px] text-gray-400 italic mt-8 text-center">
              Firma není plátcem DPH. Zapsáno v živnostenském rejstříku.
            </p>
          )}

          {/* Footer Branding */}
          <div className="text-center text-[10px] text-gray-400 mt-12 border-t border-gray-100 pt-4">
            Vygenerováno systémem CleanTextil Calc. Strana 1 / 1
          </div>
        </div>

      </div>
    </div>
  );
}