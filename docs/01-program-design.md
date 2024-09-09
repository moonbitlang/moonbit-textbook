# 1. Program Design

## Program Design

Program design involves transforming informal specifications, often presented in natural language that can be ambiguous, into a program. This can be approached from two perspectives: developing a program that _meets_ the specifications, and developing a program _based on_ the specifications. The workflow we will introduce is Test-Driven Development (TDD), which entails converting specifications into test cases and iteratively testing the software throughout the development cycle to ensure it aligns with the specifications.

### Basic Workflow

The workflow of TDD can be broken down into four steps:

- Step 1: Understand the problem

  In this step, it is important to grasp the variables involved and their relationships.

- Step 2: Define the interfaces

  Here, we define how the program should interact with the environment, including interactions with other programs through function interfaces, as well as input/output with users.

- Step 3: Write the test cases

  In this step, we specify the expected behavior for both normal and abnormal inputs. For instance, when you order a beer at a bar, you should receive a beer; when you order a cocktail, you should receive a cocktail instead of a beer. However, what if you order a bowl of fried rice instead?

- Step 4: Implement the program

  When dealing with a large problem, it may be necessary to break it down into smaller subproblems and repeat the above process for each of them.

### An Example of Program Design

Let's examine this problem (source: [LeetCode 1518](https://leetcode.com/problems/water-bottles/description/)):

> There are `num_bottles` water bottles that are initially full of water. You can exchange `num_exchange` empty water bottles from the market with one full water bottle.
> The operation of drinking a full water bottle turns it into an empty bottle.
> Given the two integers `num_bottles` and `num_exchange`, return the maximum number of water bottles you can drink.

#### Step 1: Understand the Problem

In this problem, two variables are involved:

- $N_\mathrm{bottles}$: The number of full water bottles that we currently have.
- $N_\mathrm{drunk}$: The number of empty water bottles that we have drunk.

They are related in the following way:

- Initially, the value for $N_\mathrm{bottles}$ is given by the input.
- When $N_\mathrm{bottles} \ge$ `num_exchange`, we can drink `num_exchange` of them, exchange them for one full water bottle, and then repeat the process.
- When $N_\mathrm{bottles} <$ `num_exchange`, we have to drink them up and quit the process.

Our goal is to calculate the maximum number of water bottles we can consume, given `num_bottles` and `num_exchange`.

#### Step 2: Define the Interfaces

According to the problem description, there is no need to handle any input or output operations. Instead, we should return an integer that represents the maximum number of bottles based on the two input integers, `num_bottles` and `num_exchange`. Therefore, we can write the following function as the interface:

```moonbit expr
fn num_water_bottles(num_bottles: Int, num_exchange: Int) -> Int {
  abort("To be done")
}
```

In this case, we are only defining the interface since in MoonBit, it is permissible to leave certain parts of the program unimplemented while still being able to compile.

#### Step 3: Write the Test Cases

The process of writing test cases not only helps in validating the solution but also deepens your understanding of the problem. In this case, two sample test cases are provided:

```moonbit
test {
  assert_eq!(num_water_bottles(9, 3), 13) // 9 + 3 + 1 = 13
  assert_eq!(num_water_bottles(15, 4), 19)
}
```

Taking the first test case as an example, if there are initially $9$ bottles of water, after consuming $9$ bottles, it is possible to exchange them for $3$ additional bottles. Subsequently, after consuming those $3$ bottles, they can be exchanged for $1$ more bottle. However, it is not possible to make any further exchanges after consuming that $1$ bottle. Therefore, the total number of bottles that can be consumed is $9 + 3 + 1 = 13$.

#### Step 4: Implement the Program

At this step, it is possible to implement the program and verify it by running the test cases. A possible implementation that directly models the analysis of the problem is presented here.

```moonbit
fn num_water_bottles(num_bottles: Int, num_exchange: Int) -> Int {
  fn consume(num_bottles, num_drunk) {
    if num_bottles >= num_exchange {
      let num_bottles = num_bottles - num_exchange + 1
      let num_drunk = num_drunk + num_exchange
      consume(num_bottles, num_drunk)
    } else {
      num_bottles + num_drunk
    }
  }
  consume(num_bottles, 0)
}

test {
  assert_eq!(num_water_bottles(9, 3), 13) // 9 + 3 + 1 = 13
  assert_eq!(num_water_bottles(15, 4), 19)
}
```

The program can be verified by executing it [here](https://try.moonbitlang.com/#79f7b666). If there is no output, it indicates that the program has performed as expected. Alternatively, if we modify the test cases and then rerun the program, an error might be observed.

### Summary

It is recommended to adopt a TDD workflow, namely,

1. Understand the problem
2. Define the interfaces
3. Write the test cases
4. Implement the program

Modern software products are typically vast in scale, making TDD a reliable workflow for their development. By creating test cases in advance, developers can efficiently identify and rectify potential errors at an early stage, while also ensuring the seamless integration of new functions without disrupting existing ones.

Quiz: For some abnormal inputs, the sample program for the water bottles problem may fail. Can you identify them? (Hint: In MoonBit, the range of `Int` values is $-2^{31}$ to $2^{31} - 1$.)
