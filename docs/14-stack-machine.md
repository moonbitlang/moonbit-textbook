# 14. Case Study: Stack Machine

In this chapter, we are going to implement a simple stack-based virtual machine based on WebAssembly.

## Compilation vs Interpretation

Before explaining the idea of a virtual machine, let's explain two concepts: compilation and interpretation. As we all know, the code we write everyday are in text format, while what computers can really execute are binary instructions. There is a compilation process in between. Compilation is the use of a compiler to convert the source code into the target programs, so that we can execute the program with various inputs to obtain the output we expect. Many languages, such as C, are compiled languages. However, for some languages, we don't compile and execute the code directly, but instead input the source code to an interpreter, and let it read the code while simultaneously performing the actions accordingly. Such languages, e.g., JavaScript and Python, are called interpreted languages. Broadly speaking, the CPU is also a kind of interpreter.

Let's extend the topic a bit for interested students. In fact, the interpreter and the compiler are not completely separate concepts. We can transform the interpreter into a compiler through a two-way mapping. The concept used here is partial computation, which is a program optimization technique, that is, to specialize the computation based on known information. For an extreme example, if your interpreter is a calculator and your program is an arithmetic expression, then you can use these two pieces of information to directly calculate the value corresponding to the program, thus obtaining a target program. This target program is equivalent to the compiled program, and you only need to input data to get the output program.

## Virtual Machines

In addition to compilation and interpretation, another way is to combine the two. A typical example is Java. The Java Virtual Machine (JVM) was created to achieve the purpose of "writing once and running everywhere". It has a platform-independent instruction set and different interpreters for different platforms. To execute a Java program, the first step is to compile from the source code to the instruction set, and then use the interpreter to interpret the instructions.

There are two common types of virtual machines: one is the stack-based virtual machine, where operands are stored on a stack following the Last-In First-Out (LIFO) principle; the other is the register-based virtual machine, where operands are stored in registers like what actually happens in a normal computer. The stack-based virtual machine is simpler to implement and has a smaller code size, while the register-based virtual machine is closer to the actual computer organization and has higher performance.

Taking the `max` function as an example,

- Lua VM (register-based):

  ```text
  MOVE   2 0 0 ; R(2) = R(0)
  LT     0 0 1 ; R(0) < R(1)?
  JMP    1     ; JUMP -> 5 (4 + 1)
  MOVE   2 1 0 ; R(2) = R(1)
  RETURN 2 2 0 ; return R(2)
  RETURN 0 1 0 ; return
  ```

- WebAssembly VM (stack-based):

  ```wasm
  local.get $a local.set $m                     ;; let mut m = a
  local.get $a local.get $b i32.lt_s            ;; if a < b {
  if local.get $b local.set $m end              ;; m = b }
  local.get $m                                  ;; m
  ```

## WebAssembly

Now, let's give a brief introduction to WebAssembly. As its name suggests, it is a virtual instruction set, which was initially used on the web, but since it is an instruction set, it can also be used on other platforms as long as a virtual machine is implemented, so there are also runtimes like [Wasmtime](https://github.com/bytecodealliance/wasmtime), [WAMR](https://github.com/bytecodealliance/wasm-micro-runtime), [WasmEdge](https://wasmedge.org/), etc. It is also the first backend of MoonBit. One of its major features is that its instruction set also has a type system which guarantees security.

Here, we will only consider a subset of WebAssembly where the only data type is 32-bit signed integers, and we will use non-zero integers to represent `true` and zero to represent `false` in conditional statements. Also, we will only consider very limited subset of instructions as follows:

- Create a static constant: `const`
- Arithmetic operations: `add`, `minus`, `equal`, `modulo`
- Function call: `call`
- Get/set the values of local variables: `local.get`, `local.set`
- Conditional statement: `if/else`

They can be represented with MoonBit as follows:

```moonbit
enum Value { I32(Int) }

enum Instruction {
  Const(Value)                         // Create a static constant
  Add; Sub; Modulo; Equal              // Arithmetic operations
  Call(String)                         // Function call
  Local_Get(String); Local_Set(String) // Get/set the values of local variables
  If(Int, @immut/list.T[Instruction], @immut/list.T[Instruction]) // Conditional statement
}
```

The above definition is basically a one-to-one copy from WebAssembly. It is worth noting that `If` takes an integer and two instruction lists as its parameters. The integer represents the number of results to be put on the stack after the `if/else` block ends, and the two instruction lists correspond to the cases when the condition is `true` and `false`, respectively.

Similarly, we can also easily define the structures of functions and programs:

```moonbit
struct Function {
  name : String
  params : @immut/list.T[String]; result : Int; locals : @immut/list.T[String]
  instructions : @immut/list.T[Instruction]
}

struct Program {
  functions : @immut/list.T[Function]
  start : Option[String]
}
```

A function has a name, a list of parameters, a result, a list of local variables, and a list of instructions representing the function body. A program includes multiple function definitions and an optional function as the entry point.

### Examples

Now, let's take a look at some examples.

#### Basic Arithmetic Calculations

Taking `1 + 2` as an example, we have a stack which is initially empty. The first thing we need to do is to push the operands as static constants to the stack using the `Const` instruction. Then, we use the `Add` instruction to add them up. It consumes two operands from the top of the stack and stores their sum back to the top of the stack. Thus, after the operation, the top element of the stack is `3`.

```moonbit no-check
@immut/list.of([ Const(I32(1)), Const(I32(2)), Add ])
```

![](/pics/add.drawio.webp)

#### Functions and Local Variables

In a function, we need to get the values of its arguments. The following example is a function that takes two parameters and returns their sum as the result:

```moonbit no-check
add(a : Int, b : Int) { a + b }
```

We should use the `Local_Get` instruction to get the values of `a` and `b` and push them to the stack. Then we could use the `Add` instruction to perform the calculation just like what we did in our last example.

```moonbit no-check
@immut/list.of([ Local_Get("a"), Local_Get("b"), Add ])
```

![](/pics/local.drawio.webp)

To set the value of an local variable, we can use the `Local_Set` instruction.

#### Function Calls

After the function `add` is defined, we can call it to perform some calculations. Just like what we did in our first example, we first put `1` and `2` on the stack. Then, instead of using the `Add` instruction, we call the `add` function we defined using the `Call` instruction. At this time, according to the number of function parameters, the corresponding number of elements on the top of the stack will be consumed, bound to local variables in order, and an element representing the function call will be pushed to the stack. It separates the original stack elements from the function's own data, and also records the number of its return values. After the function call is finished, according to the number of return values, we take out the elements from the top of the stack, remove the element for the function call, and then put the original top elements back. After that, that we get the calculation result at the place where the function is called.

```moonbit no-check
@immut/list.Ts::[ Const(I32(1)), Const(I32(2)), Call("add") ]
```

![](/pics/return.drawio.webp)

#### Conditional Statements

For conditional statements, as we introduced earlier, we use a 32-bit integer to represent `true` or `false`. When we execute the `If` statement, we take out the top element of the stack. If it is non-zero, the `then` branch will be executed; otherwise, the `else` branch will be executed. It is worth noting that each code block in Wasm has parameter types and return value types, corresponding to the elements to be consumed from the top of the stack when entering the code block, and the elements to be put on the top of the stack when exiting the code block. For example, when we enter the `if/else` block, there is no input, so we assume that the stack is empty when we perform calculations inside the block, no matter what is on the stack originally, it is irrelevant to the current code block. And we declared to return an integer, so when we normally end the execution, there must be one and only one integer in the current calculation environment.

```moonbit no-check
@immut/list.of([
 Const(I32(1)), Const(I32(0)), Equal,
 If(1, @immut/list.of([Const(I32(1))]), @immut/list.of([Const(I32(0))]))
])
```

![](/pics/if.drawio.webp)

#### A Complete A + B Program

We use the knowledge we just introduced to implement a program that calculates the sum of two integers. The definition of the `add` function has been shown before. Now, we also add a `test_add` function as the main entry of the program, in which the only thing to pay attention to is that after calling the `add` function, we call the `print_int` function. It is a special function and we did not mention how to define input and output in Wasm, because these functions need to be implemented by external functions, and Wasm itself can be considered as a program running in a sandbox.

```moonbit expr
let program = Program::{

  start: Some("test_add"), // Program entry point

  functions: @immut/list.of([
    Function::{
      name: "add", // Addition function
      params: @immut/list.of(["a", "b"]), result: 1, locals: @immut/list.of([]),
      instructions: @immut/list.of([Local_Get("a"), Local_Get("b"), Add]),
    },
    Function::{
      name: "test_add", // calculate add and output
      params: @immut/list.of([]), result: 0, locals: @immut/list.of([]), // no input or output
      // "print_int" is a special function
      instructions: @immut/list.of([Const(I32(0)), Const(I32(1)), Call("add"), Call("print_int")]),
    },
  ]),
}
```

## Implementing a Compiler

The following is the target program in WebAssembly we want to obtain.

```wasm
;; Multiple functions
;; Wasm itself only defines operations; interaction depends on external functions
(func $print_int (import "spectest" "print_int") (param i32))

(func $add (export "add") ;; Export function to be directly used by runtime
  (param $a i32) (param $b i32) (result i32 ) ;; (a : Int, b : Int) -> Int
  local.get $a local.get $b i32.add ;;
)

(func $test_add (export "test_add") (result ) ;; Entry function with no input or output
  i32.const 0 i32.const 1 call $add call $print_int
)

(start $test_add)
```

You can compare it with the program written in MoonBit before, and you will find that the correspondence is almost one-to-one.

The next thing we need to do is to write a compiler, which should be simple because the instructions we defined with MoonBit is almost a one-to-one copy of WebAssembly instructions.

| Instruction                                 | WebAssembly Instruction                            |
| ------------------------------------------- | -------------------------------------------------- |
| `Const(I32(0))`                             | `i32.const 0`                                      |
| `Add`                                       | `i32.add`                                          |
| `Local_Get("a")`                            | `local.get $a`                                     |
| `Local_Set("a")`                            | `local.set $a`                                     |
| `Call("add")`                               | `call $add`                                        |
| `If(1, @immut/list.of([Const(I32(0))]), @immut/list.of([Const(I32(1))]))` | `if (result i32) i32.const 0 else i32.const 1 end` |

What we need to do is simply string conversion. However, it should be noted that when implementing the compiler, we should not directly use string concatenation, but make use of the built-in `Buffer` data structure. When adding new content to it, we do not need to allocate new memory every time. Thus, compared with naive string concatenation, the memory allocation operation can be reduced.

```moonbit no-check
fn Function::to_wasm(self : Function, buffer : Buffer) -> Unit
fn Program::to_wasm(self : Program, buffer : Buffer) -> Unit
fn Instruction::to_wasm(self : Instruction, buffer : Buffer) -> Unit {
  match self {
    Add => buffer.write_string("i32.add ")
    Local_Get(val) => buffer.write_string("local.get $\{val} ")
    _ => buffer.write_string("...")
  }
}
```

Of course, WebAssembly not only has a text format (WAT), but also has a binary format. [Here](https://webassembly.github.io/wabt/demo/wat2wasm/) is a useful tool that converts WAT to binary WASM. Those who are interested can also check the [WebAssembly Specification](https://webassembly.github.io/spec/core/index.html).

| Text Format   | Binary Format                                          |
| ------------- | ------------------------------------------------------ |
| `i32.const`   | 0x41                                                   |
| `i32.add`     | 0x6A                                                   |
| `local.get`   | 0x20                                                   |
| `local.set`   | 0x21                                                   |
| `call $add`   | 0x10                                                   |
| `if else end` | 0x04 (vec[instructions]) 0x05 (vec[instructions]) 0x0B |

### Multi-Level Compilation

In [Chapter 11](./parser), we introduced the syntax parser. At that time, we used it to parse basic arithmetic expressions, which were so simple that with constant folding, they can be entirely completed during compilation. However, for a program, constant folding is obviously not the norm, and it must be compiled to a backend for execution. Now, after introducing WebAssembly, we can fill in the last piece of the puzzle. We start with strings, perform lexical analysis to obtain a token stream. Then we use the syntax parser to obtain an abstract syntax tree. From this step, we compile to the WebAssembly instruction set. Finally, we can feed it to various runtime environments for execution. Of course, thanks to the "tagless final" technique we introduced, the abstract syntax tree may also be simplified.

<center><p>String → Token Stream → (Abstract Syntax Tree) → Wasm IR → Compile/Run</p></center>

The following is the definition of the syntax trees for basic arithmetic expressions adopted from [Chapter 11](./parser).

```moonbit
enum Expression {
  Number(Int)
  Plus(Expression, Expression)
  Minus(Expression, Expression)
  Multiply(Expression, Expression)
  Divide(Expression, Expression)
}
```

Therefore, we can use a simple recursive function that performs pattern matching on the AST and translates it into the corresponding sequence of WebAssembly instructions. For example, an integer is translated into a single constant instruction, and binary operations require recursive translation of the two operands followed by the instruction for the operation itself. It can be seen that we have used the operator overloading feature of MoonBit here.

```moonbit
fn compile_expression(expression : Expression) -> @immut/list.T[Instruction] {
  match expression {
      Number(i) => @immut/list.of([Const(I32(i))])
      Plus(a, b) => compile_expression(a) + compile_expression(b) + @immut/list.of([Add])
      Minus(a, b) => compile_expression(a) + compile_expression(b) + @immut/list.of([Sub])
      _ => @immut/list.of([])
  }
}
```

## Implementing an Interpreter

Now, let's take a look at interpretation. We will build an interpreter to directly interpret our previous program. Here, we need two data structures: an operand stack and an instruction queue. On the operand stack, in addition to storing the values involved in the calculation, we also store the variables stored in the environment before the function is called. The instruction queue stores to instructions to be executed. We will also expand on the original instruction set with some control instructions, such as the `EndOfFrame` instruction.

The `EndOfFrame` instruction has an integer parameter for the return values of the function. Since we only have integers as our basic data type, we only need to know the the number of return values. The entire program environment includes the program definition, as well as the operand stack, instruction queue, and local variables in the current environment.

```moonbit
enum StackValue {
  Val(Value) // Ordinary value
  Func(@immut/hashmap.T[String, Value]) // Function stack, stores previous local variables
}
enum AdministrativeInstruction {
  Plain(Instruction) // Ordinary instruction
  EndOfFrame(Int) // Function end instruction
}
struct State {
  program : Program
  stack : @immut/list.T[StackValue]
  locals : @immut/hashmap.T[String, Value]
  instructions : @immut/list.T[AdministrativeInstruction]
}
```

What we need to do now is calculate the next state based on the previous state by pattern matching on the current instruction and data stack. Since errors may occur, the returned state should be wrapped by `Option`. If the match is successful, like the `Add` instruction here, there should be two consecutive integers representing the operands at the top of the stack, then we can calculate the next state. If all matches fail, it means something went wrong, and we use a wildcard to handle such cases and return a `None`.

```moonbit
fn evaluate(state : State, stdout : Buffer) -> Option[State] {
  match (state.instructions, state.stack) {
    (Cons(Plain(Add), tl), Cons(Val(I32(b)), Cons(Val(I32(a)), rest))) =>
      Some(
        State::{ ..state, instructions: tl, stack: Cons(Val(I32(a + b)), rest) },
      )
    _ => None
  }
}
```

![](/pics/interp_add.drawio.webp)

For conditional statement, we need to take out the code of the corresponding branch from the stack and add it to the instruction queue. It should be noted that the stored instructions should not be not expanded, so we perform a mapping here.

```moonbit no-check
(Cons(Plain(If(_, then, else_)), tl), Cons(Val(I32(i)), rest)) =>
  Some(State::{..state,
      stack: rest,
      instructions: (if i != 0 { then } else { else_ }).map(
        AdministrativeInstruction::Plain,
      ).concat(tl)})
```

![](/pics/interp_if.drawio.webp)

Next is the function call. As we mentioned earlier, without external APIs, WebAssembly cannot perform input and output. To solve this problem, we specially handle the function calls for `print_int`. If a call is detected, we directly output its value to our cache.

```moonbit no-check
(Cons(Plain(Call("print_int")), tl), Cons(Val(I32(i)), rest)) => {
  stdout.write_string(i.to_string())
  Some(State::{ ..state, stack: rest, instructions: tl })
}
```

![](/pics/interp_print_int.drawio.webp)

For ordinary function calls, we need to save the current environment and then enter the new environment for the call. That is why we need to add the `EndOfFrame` instruction. In terms of data, we need to take a certain number of elements from the top of the current stack according to the number of function parameters to become the new function call environment. After that, we add a function stack on the stack, which stores the current environment variables.

![](/pics/interp_call.drawio.webp)

After execution, it should be encountering the control instruction to return the function at this time. We take out the elements from the top of the stack according to the number of return values stored in the instruction, clear the current environment, until the function stack that was previously stored. We restore the original environment from it, and then continue the calculation.

![](/pics/interp_end_call.drawio.webp)

## Summary

In this chapter we

- Learned the structure of a stack-based virtual machine
- Introduced a subset of the WebAssembly instruction set
- Implemented a compiler
- Implemented an interpreter

Interested readers may try to expand the definition of functions in the syntax parser, or add the `return` instruction to the instruction set.
