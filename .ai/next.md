* e2e tests with Playwright
* adding landing page
* fixing layout - remove double page title, think about better element placing
* adding gh actions
* Fix name filtering in task container
I have a problem. in @TaskTableToolbar.tsx , when I write text into Filter task input, debouncedDescriptionChange() is called and the page reloads. This is unexpected, I'd rather the data load in the background