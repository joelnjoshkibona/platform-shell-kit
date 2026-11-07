# Building a product on the platform kit

This guide explains, from the beginning, how a product is designed and built on the platform kit. It is written for someone who has never seen the kit: every term is explained the first time it appears, every step says which files it touches, which commands to run and how to check that it worked.

## What you will learn

- What a "product" on this platform is, and the pieces it is made of (an API, a web app, a phone app, a prototype and its documents).
- How decisions are made and written down, so nobody re-argues them.
- Why every product starts as a clickable prototype, and how to make one.
- How the code is organised: one folder per module, on every side.
- The life of a module, from an idea to a released feature, and how it is changed or retired later.
- How to build one module end to end, with real code.
- How lists, details pages, forms and links work, on the web and on the phone.
- How the work is tested, planned, tracked and explained (this guide is one of the deliverables).
- How a product is released and run.

## How to read it

Read chapters 1 to 5 once, in order: they give you the map. Chapter 6 is a tutorial you follow with your hands on the keyboard. The later chapters are reference: come back to them when you need them. Words in `code style` are file names, commands or names in the code. The glossary at the end explains the platform's own words.

> **Note**: Each product has its **own** build guide too, made from `templates/guide/`. The product's guide explains that product (its modules, its data, how each part was built). This kit guide explains what every product shares.

## The three promises

1. **The shell is decided.** Sign-in, the sidebar, lists, details pages, forms, approvals, the phone app's behaviour: all decided once for every product (the "P" decisions). A product adds its own modules and never re-designs the shell.
2. **Design before code.** A product is designed as a clickable prototype first, with its decisions written down. The code then builds exactly that.
3. **Anyone can rebuild it.** The implementation plan, the progress tracker and the build guide are updated with every change, so a new developer (or an agent) can follow them and build the product again without asking.
