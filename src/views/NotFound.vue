<template>
  <div class="not-found">
    <h1>404</h1>
    <h2>Page Not Found</h2>
    <p>The page you're looking for doesn't exist or has been moved.</p>
    <router-link to="/" class="home-link">Go to Home</router-link>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style scoped>
.not-found {
  text-align: center;
  padding: 50px 20px;
}

h1 {
  font-size: 72px;
  color: #3399cc;
  margin: 0;
}

h2 {
  color: #333;
  margin: 20px 0;
}

p {
  color: #666;
  margin-bottom: 30px;
}

.home-link {
  display: inline-block;
  padding: 10px 20px;
  background: #3399cc;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  transition: background 0.3s;
}

.home-link:hover {
  background: #2980b9;
}
</style> 