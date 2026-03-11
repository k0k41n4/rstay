<script>
  import { onMount } from 'svelte';
  import flatpickr from 'flatpickr';
  import 'flatpickr/dist/flatpickr.css';
  
  let name = '';
  let email = '';
  let roomType = 'Minimal Haven'; // Default
  let checkIn = '';
  let checkOut = '';
  let loading = false;

  // DAFTAR HARGA VARIABEL (Ganti angkanya di sini, Bro)
  const roomRates = {
    'Super Haven': 650000,
    'Minimal Haven': 450000,
    'The Flock Room': 350000
  };

  // Reactive: Ambil harga per malam sesuai tipe kamar yang dipilih
  $: pricePerNight = roomRates[roomType] || 0;

  // Reactive: Hitung durasi menginap
  $: nights = (checkIn && checkOut) 
    ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) 
    : 0;

  // Reactive: Total Biaya Akhir
  $: totalAmount = nights > 0 ? nights * pricePerNight : 0;

  onMount(() => {
    flatpickr("#checkin-picker", {
      minDate: "today",
      dateFormat: "Y-m-d",
      onChange: (selectedDates, dateStr) => { checkIn = dateStr; }
    });

    flatpickr("#checkout-picker", {
      minDate: "today",
      dateFormat: "Y-m-d",
      onChange: (selectedDates, dateStr) => { checkOut = dateStr; }
    });
  });

  async function handleBooking() {
    if (!name || !email || !checkIn || !checkOut || nights <= 0) {
      alert('Lengkapin datanya dulu yang bener, Bro!');
      return;
    }

    loading = true;
    try {
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          roomType, 
          checkIn, 
          checkOut,
          nights,
          pricePerNight, // Kirim harga per malamnya juga ke backend
          amount: totalAmount 
        })
      });

      const data = await response.json();
      if (data.token) {
        // @ts-ignore
        window.snap.pay(data.token, {
          onSuccess: (result) => alert("Pembayaran Berhasil!"),
          onPending: (result) => alert("Menunggu Pembayaran..."),
          onError: (result) => alert("Pembayaran Gagal!"),
          onClose: () => alert('Anda menutup jendela pembayaran.')
        });
      }
    } catch (err) {
      console.error(err);
      alert('Sistem lagi error, coba lagi nanti.');
    } finally {
      loading = false;
    }
  }
</script>

<div class="max-w-xl mx-auto bg-slate-900 p-8 md:p-10 shadow-[30px_30px_0px_0px_rgba(0,71,171,0.1)] border border-slate-100 rounded-2xl">
  <div class="flex justify-between items-start mb-10">
    <img src="/logo.png" alt="RStay" class="h-20 w-auto" />
    <div class="text-right">
      <h3 class="text-xl font-black uppercase tracking-tighter text-[#0047AB] italic leading-none text-right">Instant</h3>
      <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Booking Engine</p>
    </div>
  </div>

  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input bind:value={name} type="text" placeholder="Your Name" class="bg-slate-50 border-2 border-transparent focus:border-[#0047AB] p-4 rounded-2xl outline-none font-medium" />
      <input bind:value={email} type="email" placeholder="Email Address" class="bg-slate-50 border-2 border-transparent focus:border-[#0047AB] p-4 rounded-2xl outline-none font-medium" />
    </div>

    <div class="relative">
      <label class="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest ml-1">Select Your Haven</label>
      <select bind:value={roomType} class="w-full bg-slate-50 border-2 border-transparent focus:border-[#0047AB] p-4 rounded-2xl outline-none font-bold text-slate-800 appearance-none cursor-pointer">
        {#each Object.keys(roomRates) as type}
          <option value={type}>{type} (Rp {roomRates[type].toLocaleString('id-ID')})</option>
        {/each}
      </select>
      <div class="absolute right-5 bottom-4 pointer-events-none opacity-40 text-sm">▼</div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="relative">
        <label class="absolute -top-2 left-4 bg-white px-2 text-[9px] font-black text-[#0047AB] uppercase tracking-widest z-10">Check-In</label>
        <input id="checkin-picker" placeholder="Select Date" class="w-full bg-white border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-[#0047AB] font-bold text-slate-700 cursor-pointer shadow-sm" readonly />
      </div>
      <div class="relative">
        <label class="absolute -top-2 left-4 bg-white px-2 text-[9px] font-black text-[#0047AB] uppercase tracking-widest z-10">Check-Out</label>
        <input id="checkout-picker" placeholder="Select Date" class="w-full bg-white border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-[#0047AB] font-bold text-slate-700 cursor-pointer shadow-sm" readonly />
      </div>
    </div>

    {#if nights > 0}
      <div class="bg-[#0047AB] p-6 rounded-2xl text-white shadow-xl shadow-blue-200 transform animate-in zoom-in duration-300">
        <div class="flex justify-between text-[10px] font-black opacity-80 uppercase tracking-[0.2em] mb-3">
          <span>{roomType} Booking</span>
          <span>{nights} Night(s)</span>
        </div>
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs opacity-70">Rate / Night</span>
          <span class="text-sm font-bold italic">Rp {pricePerNight.toLocaleString('id-ID')}</span>
        </div>
        <div class="flex justify-between items-end pt-3 border-t border-white/20 mt-3">
          <span class="text-xs font-bold uppercase tracking-widest">Total Payment</span>
          <span class="text-3xl font-black italic">Rp {totalAmount.toLocaleString('id-ID')}</span>
        </div>
      </div>
    {:else}
       <div class="p-6 border-2 border-dashed border-slate-100 rounded-3xl text-center">
         <p class="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Pick dates to calculate price</p>
       </div>
    {/if}

    <button 
      on:click={handleBooking} 
      disabled={loading || nights <= 0} 
      class="w-full bg-slate-900 text-red-500 font-black py-5 rounded-2xl hover:bg-[#0047AB] disabled:bg-red-100 disabled:text-red-300 transition-all active:scale-95 shadow-lg shadow-slate-100 uppercase tracking-widest text-sm"
    >
      {loading ? 'Processing Transaction...' : 'Confirm & Pay Now'}
    </button>
  </div>
</div>