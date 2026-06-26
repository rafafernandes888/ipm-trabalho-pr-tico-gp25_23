export default defineNuxtRouteMiddleware((to, from) => {
    const authenticated = useCookie<boolean>('authenticated', { default: () => false });

    // extract language from the URL path ('/en/dashboard' -> 'en')
    const pathParts = to.path.split('/');
    let lang = pathParts[1];
    if (lang!='de' && lang!='en' && lang!='es' && lang!='fr' && lang!='it' && lang!='zh-CN') {
      lang='';
    }

    if (lang) {
      if (authenticated.value && (to.path ==='/'+lang+'/' || to.path ==='/'+lang)) {
        return navigateTo('/'+lang+'/dashboard'); // only can go to login if sign out manually
      } else if (authenticated.value && to.path ==='/') {
        return navigateTo('/dashboard');
        }
    }
  });
  