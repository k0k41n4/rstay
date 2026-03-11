<script>
  import { onMount } from 'svelte';
  import flatpickr from 'flatpickr';
  import 'flatpickr/dist/flatpickr.css';
  
  let name = '';
  let email = '';
  let roomType = 'Minimal Haven'; 
  let checkIn = '';
  let checkOut = '';
  let loading = false;

  const roomRates = {
    'Super Haven': 650000,
    'Minimal Haven': 450000,
    'The Flock Room': 350000
  };

  $: pricePerNight = roomRates[roomType] || 0;
  $: nights = (checkIn && checkOut) 
    ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) 
    : 0;
  $: totalAmount = nights > 0 ? nights * pricePerNight : 0;

  onMount(() => {
    flatpickr(".date-picker", {
      minDate: "today",
      dateFormat: "Y-m-d",
      // Kita paksa tema gelap buat kalendernya lewat CSS nanti
    });
  });

  async function handleBooking() {
    if (!name || !email || !checkIn || !checkOut || nights <= 0) {
      alert('Lengkapin datanya dulu, Bro!');
      return;
    }
    loading = true;
    try {
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, roomType, checkIn, checkOut, nights, pricePerNight, amount: totalAmount })
      });
      const data = await response.json();
      if (data.token) {
        // @ts-ignore
        window.snap.pay(data.token, {
          onSuccess: (result) => alert("Pembayaran Berhasil!"),
          onClose: () => alert('Booking belum selesai.')
        });
      }
    } catch (err) {
      alert('Sistem lagi error.');
    } finally { loading = false; }
  }
</script>

<div class="max-w-xl mx-auto bg-slate-900 p-8 md:p-10 shadow-[0px_20px_50px_rgba(0,0,0,0.5)] border border-white/10 rounded-[2.5rem]">
  <div class="flex justify-between items-center mb-10">
    <img src="/logo.png" alt="RStay" class="h-16 w-auto brightness-0 invert" />
    <div class="text-right">
      <h3 class="text-xl font-black uppercase tracking-tighter text-blue-500 italic leading-none">Secure</h3>
      <p class="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">Payment Gate</p>
    </div>
  </div>

  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-1">
        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
        <input bind:value={name} type="text" placeholder="Esa Maheswara" class="w-full bg-white/5 border border-white/10 focus:border-blue-500 p-4 rounded-2xl outline-none font-medium text-white transition-all" />
      </div>
      <div class="space-y-1">
        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
        <input bind:value={email} type="email" placeholder="esa@sorelabs.com" class="w-full bg-white/5 border border-white/10 focus:border-blue-500 p-4 rounded-2xl outline-none font-medium text-white transition-all" />
      </div>
    </div>

    <div class="space-y-1">
      <label class="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Choose Haven</label>
      <div class="relative">
        <select bind:value={roomType} class="w-full bg-white/5 border border-white/10 focus:border-blue-500 p-4 rounded-2xl outline-none font-bold text-white appearance-none cursor-pointer">
          {#each Object.keys(roomRates) as type}
            <option value={type} class="bg-slate-900 text-white">{type} (Rp {roomRates[type].toLocaleString('id-ID')})</option>
          {/each}
        </select>
        <div class="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 text-white text-xs">▼</div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="space-y-1">
        <label class="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">Check-In</label>
        <input bind:value={checkIn} readonly placeholder="Select Date" class="date-picker w-full bg-slate-300/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 font-bold text-white cursor-pointer transition-all" />
      </div>
      <div class="space-y-1">
        <label class="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">Check-Out</label>
        <input bind:value={checkOut} readonly placeholder="Select Date" class="date-picker w-full bg-slate-300/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 font-bold text-white cursor-pointer transition-all" />
      </div>
    </div>

    {#if nights > 0}
      <div class="bg-blue-600 p-6 rounded-3xl text-white shadow-2xl shadow-blue-900/40 transform animate-in zoom-in duration-300">
        <div class="flex justify-between text-[10px] font-black opacity-70 uppercase tracking-[0.2em] mb-3">
          <span>{roomType}</span>
          <span>{nights} Night(s)</span>
        </div>
        <div class="flex justify-between items-end pt-3 border-t border-white/10 mt-3">
          <span class="text-xs font-bold uppercase tracking-widest opacity-80">Total Payment</span>
          <span class="text-3xl font-black italic">Rp {totalAmount.toLocaleString('id-ID')}</span>
        </div>
      </div>
    {:else}
       <div class="p-6 border-2 border-dashed border-white/5 rounded-3xl text-center">
         <p class="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">Waiting for dates...</p>
       </div>
    {/if}

    <button 
      on:click={handleBooking} 
      disabled={loading || nights <= 0} 
      class="w-full bg-white text-slate-900 font-black py-5 rounded-2xl hover:bg-blue-500 hover:text-white disabled:bg-slate-800 disabled:text-slate-600 transition-all active:scale-95 uppercase tracking-widest text-sm"
    >
      {loading ? 'Processing...' : 'Confirm Booking'}
    </button>
  </div>
</div>

<style>
  /* Biar kalendernya juga tema Dark */
  :global(.flatpickr-calendar) {
    background: #0f172a !important; /* slate-900 */
    border: 1px solid rgba(255,255,255,0.1) !important;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
  }
  :global(.flatpickr-day) { color: white !important; }
  :global(.flatpickr-current-month, .flatpickr-weekday) { color: white !important; fill: white !important; }
  :global(.flatpickr-day.selected) { background: #2563eb !important; border-color: #2563eb !important; }
  :global(.flatpickr-day:hover) { background: rgba(255,255,255,0.1) !important; }

  /* ... CSS yang lama tetep ada, tambahin ini di bawahnya ... */

  /* Fix Background Dropdown Bulan & Tahun */
  :global(.flatpickr-monthDropdown-months),
  :global(.numInput.cur-year) {
    background: #0f172a !important; /* Slate-900 */
    color: white !important;
    border: none !important;
    outline: none !important;
  }

  /* Fix Container Bulan biar nggak ada putih-putih di pinggir */
  :global(.flatpickr-current-month) {
    padding: 0 !important;
  }

  /* Styling dropdown bulan pas dibuka (khusus browser tertentu) */
  :global(.flatpickr-monthDropdown-month) {
    background: #0f172a !important;
    color: white !important;
  }

  /* Fix panah navigasi bulan */
  :global(.flatpickr-prev-month svg), 
  :global(.flatpickr-next-month svg) {
    fill: white !important;
  }

  /* Hover effect pada dropdown */
  :global(.flatpickr-monthDropdown-months:hover) {
    background: rgba(255, 255, 255, 0.05) !important;
  }
</style>