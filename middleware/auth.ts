export default defineNuxtRouteMiddleware((to, from) => {
    const authenticated = useCookie<boolean>('authenticated', { default: () => false });
    const userId = useCookie<string>('userID', { default: () => '' });
    // extract language from the URL path ('/en/dashboard' -> 'en')
    const pathParts = to.path.split('/');
    let lang = pathParts[1];
    if (lang!='de' && lang!='en' && lang!='es' && lang!='fr' && lang!='it' && lang!='zh-CN') {
      lang='';
    }
    if (!authenticated.value && to.path !== '/' ) {
      return navigateTo('/'+lang); //only go through if authenticated
    } else if (authenticated.value && to.path !== '/' && ((to.path == '/dashboard' || to.path == '/'+lang+'/dashboard') || (to.path == '/students' || to.path == '/'+lang+'/students')) && !userId.value.includes('@')) {
        if (lang) {
          return navigateTo('/'+lang+'/schedule');
        } else {
          return navigateTo('/schedule');
        }
    } else if (authenticated.value && to.path !== '/' && (to.path == '/schedule' || to.path == '/'+lang+'/schedule') && userId.value.includes('@')) {
      if (lang) {
        return navigateTo('/'+lang+'/dashboard');
      } else {
        return navigateTo('/dashboard');
      }
  }
  });