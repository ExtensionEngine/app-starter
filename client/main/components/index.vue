<template>
  <div>
    <navbar />
    <v-container class="pt-10">
      Hello!
    </v-container>
  </div>
</template>

<script>
import Navbar from './common/Navbar';

export default {
  name: 'home',
  components: { Navbar }
};
</script>
