# Refactoring

You've been asked to refactor the function `deterministicPartitionKey` in [`dpk.js`](dpk.js) to make it easier to read and understand without changing its functionality. For this task, you should:

1. Write unit tests to cover the existing functionality and ensure that your refactor doesn't break it. We typically use `jest`, but if you have another library you prefer, feel free to use it.
2. Refactor the function to be as "clean" and "readable" as possible. There are many valid ways to define those words - use your own personal definitions, but be prepared to defend them. Note that we do like to use the latest JS language features when applicable.
3. Write up a brief (~1 paragraph) explanation of why you made the choices you did and why specifically your version is more "readable" than the original.

You will be graded on the exhaustiveness and quality of your unit tests, the depth of your refactor, and the level of insight into your thought process provided by the written explanation.

## Your Explanation Here

I've left explanation as comments throught the code and unit tests. Here is summary:

    - I have tried not to assume functionality of 3rd party methods except of these instances:
        - I assumed there is no need to recreate the hash object, so I am now creating it only once per function call and based on context probably we can even extract it
          and use one instance of hash object per app session if my assumption is correct, but here I left it inside the sub function, since there is no context
        - I assumed that calling JSON.stringify on string will keep the return the same string. I did this in order to simplify the code and remove the check for type string from the function
        - Otherwise I've tried to call the 3rd party methods in same logical paths as before (e.g. not to create hash object prematurely, etc...)

    - I have tried to use early returns for readability (case with input event and existing partition key)
    - I extracted the hashing logic to separate function just for clarity. It abstracts the crypto methods and hides the logic of rehashing when the hash length is exceeded.
    - Could shorten the code in the main function even more if I use logical operators, but I decided against that. It will make the code shorter, but I don't think it would be easier to read,
      so I kept the 'if' version
