<template>
  <div class="min-h-screen bg-[#121212] text-white relative pb-24 md:pb-8">
    <!-- Back Button -->
    <button 
      @click="$router.go(-1)" 
      class="absolute top-6 left-6 text-white/70 hover:text-white"
    >
      <i class="fas fa-arrow-left text-xl"></i>
    </button>

    <!-- Header Section -->
    <div class="pt-20 px-6 text-center mb-8">
      <h1 class="text-3xl font-bold bg-gradient-to-r from-[#c30059] to-[#ff4d4d] bg-clip-text text-transparent">
        My Wallet
      </h1>
      <p class="text-white/60 mt-2">Manage your earnings and withdrawals</p>
    </div>

    <div class="max-w-6xl mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        <!-- Left Column -->
        <div class="md:col-span-8 space-y-6">
          <!-- Wallet Balance Card -->
          <div class="bg-gradient-to-br from-[#2a2a2a] to-[#1d1d1d] rounded-2xl p-6 border border-white/10 backdrop-blur-xl">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-white/90">Wallet Balance</h2>
              <div class="w-10 h-10 rounded-full bg-gradient-to-r from-[#c30059]/10 to-[#ff4d4d]/10 flex items-center justify-center">
                <i class="fas fa-wallet text-transparent bg-clip-text bg-gradient-to-r from-[#c30059] to-[#ff4d4d]"></i>
              </div>
            </div>
            <div class="flex items-baseline gap-2 mb-6">
              <span class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#c30059] to-[#ff4d4d]">
                ₹{{ walletBalance }}
              </span>
              <span class="text-white/50">available balance</span>
            </div>
            <button 
              @click="showWithdrawModal" 
              :disabled="!walletBalance"
              class="w-full py-3 px-6 bg-gradient-to-r from-[#c30059] to-[#ff4d4d] rounded-xl text-white font-medium hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <i class="fas fa-money-bill-wave"></i>
              Withdraw Money
            </button>
          </div>

          <!-- Recent Transactions -->
          <div class="bg-[#2a2a2a]/50 backdrop-blur-lg rounded-2xl border border-white/10">
            <div class="p-6 border-b border-white/10">
              <h3 class="text-xl font-semibold text-white/90">Recent Transactions</h3>
            </div>
            <div class="divide-y divide-white/5">
              <div v-if="transactions.length" class="max-h-[400px] overflow-y-auto">
                <div v-for="transaction in transactions" 
                     :key="transaction.id" 
                     class="p-4 hover:bg-white/5 transition-colors">
                  <div class="flex items-center gap-4">
                    <div :class="[
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      getTransactionTypeClass(transaction.transaction_type)
                    ]">
                      <i :class="[getTransactionIcon(transaction.transaction_type), 'text-xl']"></i>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-start justify-between">
                        <div>
                          <p class="font-medium text-white">
                            {{ formatTransactionType(transaction.transaction_type) }}
                          </p>
                          <p class="text-sm text-white/50">{{ formatDate(transaction.created_at) }}</p>
                        </div>
                        <div class="text-right">
                          <p :class="[
                            'font-medium',
                            getAmountClass(transaction.transaction_type)
                          ]">
                            {{ getAmountPrefix(transaction.transaction_type) }}₹{{ transaction.amount }}
                          </p>
                          <span :class="[
                            'text-xs px-2 py-1 rounded-full',
                            {
                              'bg-green-500/10 text-green-500': transaction.status === 'COMPLETED',
                              'bg-yellow-500/10 text-yellow-500': transaction.status === 'PENDING',
                              'bg-red-500/10 text-red-500': transaction.status === 'FAILED'
                            }
                          ]">
                            {{ transaction.status }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="p-12 text-center">
                <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-receipt text-2xl text-white/30"></i>
                </div>
                <p class="text-white/60">No transactions yet</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="md:col-span-4 space-y-6">
          <!-- Referral Bonus Settings -->
          <div class="bg-[#2a2a2a]/50 backdrop-blur-lg rounded-2xl border border-white/10">
            <div class="p-6 border-b border-white/10">
              <h3 class="text-xl font-semibold text-white/90 flex items-center gap-2">
                <i class="fas fa-gift text-transparent bg-clip-text bg-gradient-to-r from-[#c30059] to-[#ff4d4d]"></i>
                Referral Bonus
              </h3>
            </div>
            <div class="p-4">
              <div v-if="bonusLevels.length" class="space-y-4">
                <div v-for="level in bonusLevels" 
                     :key="level.id"
                     class="bg-white/5 rounded-xl p-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div :class="[
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        {
                          'bg-blue-500/10 text-blue-500': level.level === 1,
                          'bg-green-500/10 text-green-500': level.level === 2,
                          'bg-purple-500/10 text-purple-500': level.level === 3,
                          'bg-orange-500/10 text-orange-500': level.level === 4,
                          'bg-pink-500/10 text-pink-500': level.level === 5
                        }
                      ]">
                        <span class="font-semibold">L{{ level.level }}</span>
                      </div>
                      <div>
                        <p class="font-medium text-white">Level {{ level.level }}</p>
                        <p class="text-sm text-white/50">{{ level.description }}</p>
                      </div>
                    </div>
                    <div>
                      <span :class="[
                        'text-lg font-bold',
                        {
                          'text-blue-500': level.level === 1,
                          'text-green-500': level.level === 2,
                          'text-purple-500': level.level === 3,
                          'text-orange-500': level.level === 4,
                          'text-pink-500': level.level === 5
                        }
                      ]">
                        {{ level.amount }}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8">
                <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-gift text-2xl text-white/30"></i>
                </div>
                <p class="text-white/60">No bonus levels configured</p>
              </div>
            </div>
          </div>

          <!-- Bank Accounts Section -->
          <div class="bg-[#2a2a2a]/50 backdrop-blur-lg rounded-2xl border border-white/10">
            <div class="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 class="text-xl font-semibold text-white/90">Bank Accounts</h3>
              <button 
                @click="showAddBankModal"
                class="w-8 h-8 rounded-full bg-gradient-to-r from-[#c30059] to-[#ff4d4d] flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <i class="fas fa-plus text-white"></i>
              </button>
            </div>
            
            <div class="p-4">
              <div v-if="bankAccounts.length" class="space-y-4">
                <div v-for="account in bankAccounts" 
                     :key="account.id"
                     class="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer"
                     @click="showBankDetails(account)">
                  <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-r from-[#c30059]/10 to-[#ff4d4d]/10 flex items-center justify-center">
                      <i class="fas fa-university text-transparent bg-clip-text bg-gradient-to-r from-[#c30059] to-[#ff4d4d]"></i>
                    </div>
                    <div class="flex-1">
                      <p class="font-medium text-white">{{ account.bank_name }}</p>
                      <p class="text-sm text-white/50">{{ account.account_number }}</p>
                      <p class="text-sm text-white/50">{{ account.account_holder_name }}</p>
                    </div>
                    <div>
                      <button 
                        v-if="!account.is_primary"
                        @click.stop="setPrimaryAccount(account.id)"
                        class="text-sm text-[#c30059] hover:text-[#ff4d4d] transition-colors"
                      >
                        Set Primary
                      </button>
                      <span 
                        v-else 
                        class="text-xs px-2 py-1 rounded-full bg-[#c30059]/10 text-[#ff4d4d]"
                      >
                        Primary
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8">
                <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-university text-2xl text-white/30"></i>
                </div>
                <p class="text-white/60 mb-4">No bank accounts added</p>
                <button 
                  @click="showAddBankModal"
                  class="text-sm text-[#c30059] hover:text-[#ff4d4d] transition-colors"
                >
                  + Add Your First Bank Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Bank Account Modal -->
    <div v-if="showBankModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-[#2a2a2a] rounded-2xl w-full max-w-lg border border-white/10 animate-modal-in">
        <div class="p-6 border-b border-white/10">
          <h3 class="text-xl font-semibold text-white">Add Bank Account</h3>
        </div>
        <form @submit.prevent="addBankAccount" class="p-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-white/70 mb-2">Account Holder Name</label>
              <input 
                v-model="newBank.account_holder_name" 
                type="text" 
                required
                class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#c30059] transition-colors"
                placeholder="Enter account holder name"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-white/70 mb-2">Account Number</label>
              <input 
                v-model="newBank.account_number" 
                type="text" 
                required
                class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#c30059] transition-colors"
                placeholder="Enter account number"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-white/70 mb-2">IFSC Code</label>
              <input 
                v-model="newBank.ifsc_code" 
                type="text" 
                required
                class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#c30059] transition-colors"
                placeholder="Enter IFSC code"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-white/70 mb-2">Bank Name</label>
              <input 
                v-model="newBank.bank_name" 
                type="text" 
                required
                class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#c30059] transition-colors"
                placeholder="Enter bank name"
              >
            </div>
          </div>
          <div class="flex justify-end gap-4 mt-6">
            <button 
              type="button" 
              @click="closeBankModal"
              class="px-6 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="px-6 py-3 bg-gradient-to-r from-[#c30059] to-[#ff4d4d] rounded-xl text-white hover:opacity-90 transition-opacity"
            >
              Add Bank Account
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Withdraw Money Modal -->
    <div v-if="showWithdrawalModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-[#2a2a2a] rounded-2xl w-full max-w-lg border border-white/10 animate-modal-in">
        <div class="p-6 border-b border-white/10">
          <h3 class="text-xl font-semibold text-white">Withdraw Money</h3>
        </div>
        <form @submit.prevent="withdrawMoney" class="p-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-white/70 mb-2">Select Bank Account</label>
              <select 
                v-model="withdrawal.bank_account" 
                required
                class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#c30059] transition-colors"
              >
                <option v-for="account in bankAccounts" 
                        :key="account.id" 
                        :value="account.id"
                        class="bg-[#2a2a2a]"
                >
                  {{ account.bank_name }} - {{ account.account_number }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-white/70 mb-2">
                Amount (₹)
                <div class="flex flex-wrap gap-2 mt-1">
                  <span class="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">
                    <i class="fas fa-arrow-down text-xs mr-1"></i>Min: ₹{{ withdrawalLimits.min_amount }}
                  </span>
                  <span class="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">
                    <i class="fas fa-arrow-up text-xs mr-1"></i>Max: ₹{{ withdrawalLimits.max_amount }}
                  </span>
                  <span class="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-400">
                    <i class="fas fa-clock text-xs mr-1"></i>Daily Limit: {{ withdrawalLimits.daily_limit }} withdrawals
                  </span>
                  <span v-if="withdrawalLimits.remaining_today !== undefined" class="text-xs px-2 py-1 rounded-full bg-orange-500/10 text-orange-400">
                    <i class="fas fa-refresh text-xs mr-1"></i>Remaining Today: {{ withdrawalLimits.remaining_today }}
                  </span>
                </div>
              </label>
              <input 
                v-model="withdrawal.amount" 
                type="number" 
                required
                :min="withdrawalLimits.min_amount"
                :max="withdrawalLimits.max_amount"
                class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#c30059] transition-colors"
                :placeholder="'Enter amount between ₹' + withdrawalLimits.min_amount + ' and ₹' + withdrawalLimits.max_amount"
              >
            </div>
            <!-- Error Message -->
            <div v-if="withdrawalError" class="bg-red-500/10 text-red-500 p-3 rounded-xl text-sm">
              {{ withdrawalError }}
            </div>
          </div>
          <div class="flex justify-end gap-4 mt-6">
            <button 
              type="button" 
              @click="closeWithdrawModal"
              class="px-6 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="px-6 py-3 bg-gradient-to-r from-[#c30059] to-[#ff4d4d] rounded-xl text-white hover:opacity-90 transition-opacity"
            >
              Withdraw
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Bank Account Details Modal -->
    <div v-if="showBankDetailsModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-[#2a2a2a] rounded-2xl w-full max-w-lg border border-white/10 animate-modal-in">
        <!-- Header -->
        <div class="p-6 border-b border-white/10">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-r from-[#c30059]/10 to-[#ff4d4d]/10 flex items-center justify-center">
                <i class="fas fa-university text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#c30059] to-[#ff4d4d]"></i>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-white">Bank Account Details</h3>
                <p class="text-sm text-white/50">View your bank account information</p>
              </div>
            </div>
            <button @click="closeBankDetailsModal" class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <i class="fas fa-times text-white/70"></i>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          <!-- Status Badges -->
          <div class="flex gap-2 mb-6">
            <span v-if="selectedBank.is_primary" 
                  class="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#c30059] to-[#ff4d4d] text-white text-sm font-medium flex items-center gap-2">
              <i class="fas fa-star text-xs"></i>
              Primary Account
            </span>
            <span v-if="selectedBank.is_verified" 
                  class="px-3 py-1.5 rounded-full bg-green-500/10 text-green-500 text-sm font-medium flex items-center gap-2">
              <i class="fas fa-check-circle text-xs"></i>
              Verified
            </span>
          </div>

          <!-- Bank Details Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-white/70">Bank Name</label>
              <div class="bg-white/5 rounded-xl p-4 border border-white/10">
                <div class="flex items-center gap-3">
                  <i class="fas fa-university text-[#c30059]"></i>
                  <p class="text-white font-medium">{{ selectedBank.bank_name }}</p>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-white/70">Account Holder</label>
              <div class="bg-white/5 rounded-xl p-4 border border-white/10">
                <div class="flex items-center gap-3">
                  <i class="fas fa-user text-[#c30059]"></i>
                  <p class="text-white font-medium">{{ selectedBank.account_holder_name }}</p>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-white/70">Account Number</label>
              <div class="bg-white/5 rounded-xl p-4 border border-white/10">
                <div class="flex items-center gap-3">
                  <i class="fas fa-credit-card text-[#c30059]"></i>
                  <p class="text-white font-medium tracking-wider">{{ selectedBank.account_number }}</p>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-white/70">IFSC Code</label>
              <div class="bg-white/5 rounded-xl p-4 border border-white/10">
                <div class="flex items-center gap-3">
                  <i class="fas fa-code text-[#c30059]"></i>
                  <p class="text-white font-medium tracking-wider">{{ selectedBank.ifsc_code }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Added Date -->
          <div class="mt-6 pt-6 border-t border-white/10">
            <p class="text-sm text-white/50 flex items-center gap-2">
              <i class="fas fa-calendar-alt"></i>
              Added on {{ formatDate(selectedBank.created_at) }}
            </p>
          </div>

          <!-- Actions -->
          <div class="mt-6 flex justify-end gap-3">
            <button 
              v-if="!selectedBank.is_primary"
              @click="setPrimaryAccount(selectedBank.id)"
              class="px-4 py-2 rounded-xl bg-gradient-to-r from-[#c30059] to-[#ff4d4d] text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <i class="fas fa-star"></i>
              Set as Primary
            </button>
            <button 
              @click="closeBankDetailsModal"
              class="px-4 py-2 rounded-xl bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted, onUnmounted } from 'vue';

export default {
  name: 'WalletDashboard',
  setup() {
    const walletBalance = ref(0);
    const bankAccounts = ref([]);
    const transactions = ref([]);
    const showBankModal = ref(false);
    const showWithdrawalModal = ref(false);
    
    const newBank = ref({
      account_holder_name: '',
      account_number: '',
      ifsc_code: '',
      bank_name: ''
    });

    const withdrawalError = ref('');
    const withdrawal = ref({
      bank_account: '',
      amount: ''
    });

    const showBankDetailsModal = ref(false);
    const selectedBank = ref({});
    const bonusLevels = ref([]);
    const withdrawalLimits = ref({
      min_amount: 0,
      max_amount: 0,
      daily_limit: 0,
      remaining_today: 0
    });

    // Fetch wallet data
    const fetchWalletData = async () => {
      try {
        const response = await axios.get('/users/wallet/', {
          params: {
            phone: localStorage.getItem('phone')
          }
        });
        console.log('Wallet response:', response.data); // For debugging
        walletBalance.value = response.data.balance;
        transactions.value = response.data.recent_transactions || [];
      } catch (error) {
        console.error('Error fetching wallet data:', error);
        walletBalance.value = 0;
        transactions.value = [];
      }
    };

    // Fetch bank accounts
    const fetchBankAccounts = async () => {
      try {
        const response = await axios.get('/users/bank-accounts/', {
          params: {
            phone: localStorage.getItem('phone')
          }
        });
        bankAccounts.value = response.data;
      } catch (error) {
        console.error('Error fetching bank accounts:', error);
      }
    };

    // Fetch bonus levels
    const fetchBonusLevels = async () => {
      try {
        const response = await axios.get('/users/referral-bonus-levels/', {
          params: {
            phone: localStorage.getItem('phone')
          }
        });
        bonusLevels.value = response.data;
      } catch (error) {
        console.error('Error fetching bonus levels:', error);
      }
    };

    // Fetch withdrawal limits
    const fetchWithdrawalLimits = async () => {
      try {
        const response = await axios.get('/users/withdrawal-limits/', {
          params: {
            phone: localStorage.getItem('phone')
          }
        });
        withdrawalLimits.value = response.data;
      } catch (error) {
        console.error('Error fetching withdrawal limits:', error);
        // Set default values if API fails
        withdrawalLimits.value = {
          min_amount: 100,
          max_amount: 10000,
          daily_limit: 3,
          remaining_today: 3
        };
      }
    };

    // Add bank account
    const addBankAccount = async () => {
      try {
        const bankData = {
          ...newBank.value,
          phone: localStorage.getItem('phone')
        };
        await axios.post('/users/bank-accounts/', bankData);
        await fetchBankAccounts();
        closeBankModal();
      } catch (error) {
        console.error('Error adding bank account:', error);
      }
    };

    // Set primary bank account
    const setPrimaryAccount = async (accountId) => {
      try {
        await axios.post(`/users/bank-accounts/${accountId}/set-primary/`, {
          phone: localStorage.getItem('phone')
        });
        await fetchBankAccounts();
      } catch (error) {
        console.error('Error setting primary account:', error);
      }
    };

    // Update showWithdrawModal to fetch limits
    const showWithdrawModal = async () => {
      await fetchWithdrawalLimits();
      showWithdrawalModal.value = true;
    };

    // Validate withdrawal amount
    const validateWithdrawalAmount = () => {
      const amount = Number(withdrawal.value.amount);
      if (amount < withdrawalLimits.value.min_amount) {
        withdrawalError.value = `Minimum withdrawal amount is ₹${withdrawalLimits.value.min_amount}`;
        return false;
      }
      if (amount > withdrawalLimits.value.max_amount) {
        withdrawalError.value = `Maximum withdrawal amount is ₹${withdrawalLimits.value.max_amount}`;
        return false;
      }
      if (withdrawalLimits.value.remaining_today <= 0) {
        withdrawalError.value = 'Daily withdrawal limit reached';
        return false;
      }
      return true;
    };

    // Update withdrawMoney to include validation and refresh
    const withdrawMoney = async () => {
      try {
        withdrawalError.value = ''; // Clear previous error
        
        if (!validateWithdrawalAmount()) {
          return;
        }

        const withdrawalData = {
          ...withdrawal.value,
          phone: localStorage.getItem('phone')
        };
        
        await axios.post('/users/request-withdrawal/', withdrawalData);
        await fetchWalletData(); // Refresh wallet data
        await fetchWithdrawalLimits(); // Refresh limits after withdrawal
        closeWithdrawModal();
      } catch (error) {
        console.error('Error requesting withdrawal:', error);
        withdrawalError.value = error.response?.data?.error || 'Failed to process withdrawal';
      }
    };

    // Modal controls
    const showAddBankModal = () => {
      showBankModal.value = true;
    };

    const closeBankModal = () => {
      showBankModal.value = false;
      newBank.value = {
        account_holder_name: '',
        account_number: '',
        ifsc_code: '',
        bank_name: ''
      };
    };

    const closeWithdrawModal = () => {
      showWithdrawalModal.value = false;
      withdrawal.value = {
        bank_account: '',
        amount: ''
      };
    };

    // Show bank details
    const showBankDetails = (bank) => {
      selectedBank.value = bank;
      showBankDetailsModal.value = true;
    };

    const closeBankDetailsModal = () => {
      showBankDetailsModal.value = false;
      selectedBank.value = {};
    };

    // Utility functions
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    };

    const formatTransactionType = (type) => {
      return type.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    };

    const getTransactionTypeClass = (type) => {
      const types = {
        'REFERRAL_BONUS': 'bonus',
        'WITHDRAWAL': 'withdrawal',
        'REFUND': 'refund'
      };
      return types[type] || '';
    };

    const getTransactionIcon = (type) => {
      const icons = {
        'REFERRAL_BONUS': 'fas fa-gift',
        'WITHDRAWAL': 'fas fa-money-bill-wave',
        'REFUND': 'fas fa-undo'
      };
      return icons[type] || 'fas fa-exchange-alt';
    };

    const getAmountClass = (type) => {
      return type === 'WITHDRAWAL' ? 'amount-negative' : 'amount-positive';
    };

    const getAmountPrefix = (type) => {
      return type === 'WITHDRAWAL' ? '-' : '+';
    };

    // Add goBack method
    const goBack = () => {
      window.history.back();
    };

    // Add periodic refresh
    let refreshInterval;
    onMounted(() => {
      fetchWalletData();
      fetchBankAccounts();
      fetchBonusLevels();
      
      // Refresh wallet data every 30 seconds
      refreshInterval = setInterval(() => {
        fetchWalletData();
      }, 30000);
    });

    // Clean up interval on component unmount
    onUnmounted(() => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    });

    return {
      walletBalance,
      bankAccounts,
      transactions,
      showBankModal,
      showWithdrawalModal,
      newBank,
      withdrawalError,
      withdrawal,
      addBankAccount,
      setPrimaryAccount,
      withdrawMoney,
      showAddBankModal,
      closeBankModal,
      showWithdrawModal,
      closeWithdrawModal,
      formatDate,
      formatTransactionType,
      getTransactionTypeClass,
      getTransactionIcon,
      getAmountClass,
      getAmountPrefix,
      goBack,
      showBankDetailsModal,
      selectedBank,
      showBankDetails,
      closeBankDetailsModal,
      bonusLevels,
      withdrawalLimits,
      validateWithdrawalAmount
    };
  }
};
</script>

<style scoped>
/* Base Styles */
.min-h-screen {
  min-height: 100vh;
}

/* Animations */
@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-modal-in {
  animation: modalIn 0.3s ease-out;
}

/* Transaction Type Styles */
.bonus {
  @apply bg-green-500/10 text-green-500;
}

.withdrawal {
  @apply bg-[#c30059]/10 text-[#ff4d4d];
}

.refund {
  @apply bg-blue-500/10 text-blue-500;
}

/* Amount Colors */
.amount-positive {
  @apply text-green-500;
}

.amount-negative {
  @apply text-[#ff4d4d];
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  @apply bg-white/5 rounded-full;
}

::-webkit-scrollbar-thumb {
  @apply bg-white/20 rounded-full hover:bg-white/30 transition-colors;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .pb-24 {
    padding-bottom: calc(6rem + env(safe-area-inset-bottom, 0px));
  }
}

/* Add safe area margin for mobile devices */
.mb-safe {
  margin-bottom: env(safe-area-inset-bottom, 0px);
}

/* Hover Effects */
.hover\:opacity-90:hover {
  opacity: 0.9;
}

.hover\:bg-white\/10:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Focus Styles */
input:focus, select:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(195, 0, 89, 0.2);
}

/* Transition Effects */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Card Hover Effects */
.bg-white\/5:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Add these new styles */
.rounded-full {
  @apply transition-all duration-200;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style> 