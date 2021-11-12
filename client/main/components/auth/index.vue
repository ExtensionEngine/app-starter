<template>
  <v-container class="auth-container">
    <div class="auth-panel">
      <div class="auth-header">
        <h1>APP</h1>
      </div>
      <div class="auth-body">
        <router-view />
      </div>
    </div>
  </v-container>
</template>

<style lang="scss" scoped>
.auth-container {
  padding-top: 7%;
}

.auth-panel {
  width: 31.25rem;
  margin: auto;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.22), 0 1px 2px rgba(0,0,0,0.34);
  transition: all 0.3s cubic-bezier(0.25,0.8,0.25,1);

  &:hover {
    box-shadow: 0 2px 4px rgba(0,0,0,0.1), 0 2px 3px rgba(0,0,0,0.15);
  }

  h1 {
    margin: 0.3125rem 0 0.1875rem 0;
    color: #444;
    font-size: 1.625rem;
    font-weight: 300;

    .mdi {
      margin-right: 0.3125rem;
      font-size: 2.125rem;
    }
  }

  .auth-header {
    padding: 2.5rem 0.625rem;
    text-align: center;
    background: #ffc107;
  }

  .auth-body {
    padding: 2.5rem 1.875rem 1.25rem;
  }

  .message {
    min-height: 1rem;
    margin-bottom: 1.25rem;
    color: #444;
    font-size: 1rem;
    line-height: 1rem;
  }
}
</style>
